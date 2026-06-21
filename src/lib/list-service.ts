import { ListType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isExpired, parseCloseDateInput } from "@/lib/dates";
import { normalizePhone } from "@/lib/phone";
import { generatePublicToken } from "@/lib/tokens";
import type {
  CreateListInput,
  PresenceEntryInput,
  UpdateListInput,
  UniformOrderInput,
} from "@/lib/validators";

type ListStatusShape = {
  closeAt: Date | null;
  status: "OPEN" | "CLOSED";
  type: "PRESENCE" | "UNIFORM";
};

export class ListServiceError extends Error {
  constructor(
    public readonly code:
      | "DUPLICATE_PHONE"
      | "INVALID_CLOSE_DATE"
      | "LIST_CLOSED"
      | "NOT_FOUND"
      | "REOPEN_NOT_ALLOWED"
      | "TYPE_CHANGE_NOT_ALLOWED",
  ) {
    super(code);
  }
}

export function isEffectivelyClosed(list: ListStatusShape) {
  return list.status === "CLOSED" || (list.type === "UNIFORM" && isExpired(list.closeAt));
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function closeListIfExpired(list: { closeAt: Date | null; id: string }) {
  if (!isExpired(list.closeAt)) {
    return;
  }

  await prisma.raceList.updateMany({
    where: {
      id: list.id,
      status: "OPEN",
    },
    data: {
      closedAt: new Date(),
      status: "CLOSED",
    },
  });
}

export async function getDashboardLists(adminId: string) {
  return prisma.raceList.findMany({
    where: {
      createdById: adminId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      _count: {
        select: {
          presenceEntries: true,
          uniformOrders: true,
        },
      },
      closeAt: true,
      closedAt: true,
      createdAt: true,
      description: true,
      id: true,
      publicToken: true,
      status: true,
      title: true,
      type: true,
    },
  });
}

export async function getRaceListForAdmin(id: string, adminId: string) {
  const list = await prisma.raceList.findFirst({
    where: {
      createdById: adminId,
      id,
    },
    include: {
      _count: {
        select: {
          presenceEntries: true,
          uniformOrders: true,
        },
      },
      presenceEntries: {
        orderBy: {
          createdAt: "asc",
        },
      },
      uniformOrders: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!list) {
    throw new ListServiceError("NOT_FOUND");
  }

  return list;
}

export async function getPublicRaceListByToken(token: string) {
  const list = await prisma.raceList.findUnique({
    where: {
      publicToken: token,
    },
    include: {
      presenceEntries: {
        orderBy: {
          createdAt: "asc",
        },
      },
      uniformOrders: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!list) {
    throw new ListServiceError("NOT_FOUND");
  }

  return list;
}

export async function createRaceList(input: CreateListInput, adminId: string) {
  const closeAt =
    input.type === "UNIFORM"
      ? parseCloseDateInput(input.closeDate)
      : null;

  if (input.type === "UNIFORM" && (!closeAt || isExpired(closeAt))) {
    throw new ListServiceError("INVALID_CLOSE_DATE");
  }

  return prisma.raceList.create({
    data: {
      closeAt,
      createdById: adminId,
      description: input.description,
      publicToken: generatePublicToken(),
      title: input.title,
      type: input.type,
    },
  });
}

export async function updateRaceList(id: string, input: UpdateListInput, adminId: string) {
  const list = await getRaceListForAdmin(id, adminId);

  const hasEntries = list._count.presenceEntries + list._count.uniformOrders > 0;

  if (input.type !== list.type && hasEntries) {
    throw new ListServiceError("TYPE_CHANGE_NOT_ALLOWED");
  }

  const nextType = input.type;

  const closeAt =
    nextType === "UNIFORM"
      ? parseCloseDateInput(input.closeDate)
      : null;

  if (nextType === "UNIFORM" && (!closeAt || isExpired(closeAt))) {
    throw new ListServiceError("INVALID_CLOSE_DATE");
  }

  return prisma.raceList.update({
    where: {
      id: list.id,
    },
    data: {
      closeAt,
      description: input.description,
      title: input.title,
      type: nextType,
    },
  });
}

export async function closeRaceList(id: string, adminId: string) {
  const list = await getRaceListForAdmin(id, adminId);

  if (list.status === "CLOSED") {
    return list;
  }

  return prisma.raceList.update({
    where: {
      id: list.id,
    },
    data: {
      closedAt: new Date(),
      status: "CLOSED",
    },
  });
}

export async function reopenRaceList(id: string, adminId: string, closeDate?: string) {
  const list = await getRaceListForAdmin(id, adminId);

  if (list.type !== "UNIFORM") {
    throw new ListServiceError("REOPEN_NOT_ALLOWED");
  }

  const nextCloseAt =
    !list.closeAt || isExpired(list.closeAt)
      ? parseCloseDateInput(closeDate)
      : list.closeAt;

  if (!nextCloseAt || isExpired(nextCloseAt)) {
    throw new ListServiceError("INVALID_CLOSE_DATE");
  }

  return prisma.raceList.update({
    where: {
      id: list.id,
    },
    data: {
      closedAt: null,
      closeAt: nextCloseAt,
      status: "OPEN",
    },
  });
}

export async function createPresenceEntry(token: string, input: PresenceEntryInput) {
  const list = await prisma.raceList.findUnique({
    where: {
      publicToken: token,
    },
    select: {
      id: true,
      status: true,
      type: true,
    },
  });

  if (!list || list.type !== "PRESENCE") {
    throw new ListServiceError("NOT_FOUND");
  }

  if (list.status === "CLOSED") {
    throw new ListServiceError("LIST_CLOSED");
  }

  try {
    return await prisma.presenceEntry.create({
      data: {
        name: input.name,
        phone: input.phone,
        phoneNormalized: normalizePhone(input.phone),
        raceListId: list.id,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ListServiceError("DUPLICATE_PHONE");
    }

    throw error;
  }
}

export async function createUniformOrder(token: string, input: UniformOrderInput) {
  const list = await prisma.raceList.findUnique({
    where: {
      publicToken: token,
    },
    select: {
      closeAt: true,
      id: true,
      status: true,
      type: true,
    },
  });

  if (!list || list.type !== "UNIFORM") {
    throw new ListServiceError("NOT_FOUND");
  }

  if (list.status === "CLOSED") {
    throw new ListServiceError("LIST_CLOSED");
  }

  if (isExpired(list.closeAt)) {
    await closeListIfExpired(list);
    throw new ListServiceError("LIST_CLOSED");
  }

  try {
    return await prisma.uniformOrder.create({
      data: {
        itemType: input.itemType,
        name: input.name,
        note: input.note,
        phone: input.phone,
        phoneNormalized: normalizePhone(input.phone),
        raceListId: list.id,
        size: input.size,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ListServiceError("DUPLICATE_PHONE");
    }

    throw error;
  }
}

export async function closeExpiredUniformLists() {
  const now = new Date();

  const result = await prisma.raceList.updateMany({
    where: {
      closeAt: {
        lte: now,
      },
      status: "OPEN",
      type: ListType.UNIFORM,
    },
    data: {
      closedAt: now,
      status: "CLOSED",
    },
  });

  return result.count;
}