const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseCloseDateInput(value?: string) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!DATE_INPUT_PATTERN.test(trimmedValue)) {
    return null;
  }

  const date = new Date(`${trimmedValue}T23:59:59.999-03:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function isExpired(date: Date | null | undefined) {
  if (!date) {
    return false;
  }

  return date.getTime() <= Date.now();
}

export function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(value);
}

export function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(value);
}