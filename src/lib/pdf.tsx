import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { formatDateTime } from "@/lib/dates";
import type { getRaceListForAdmin } from "@/lib/list-service";

type ExportList = Awaited<ReturnType<typeof getRaceListForAdmin>>;

const styles = StyleSheet.create({
  bodyText: {
    color: "#3b4b43",
    fontSize: 10,
    lineHeight: 1.55,
  },
  card: {
    backgroundColor: "#f7f1e7",
    borderRadius: 14,
    marginBottom: 20,
    padding: 18,
  },
  cell: {
    borderBottomColor: "#d8d2c9",
    borderBottomWidth: 1,
    fontSize: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  headerTitle: {
    color: "#1b2b23",
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  label: {
    color: "#af542f",
    fontSize: 9,
    letterSpacing: 1.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  page: {
    backgroundColor: "#fffaf3",
    padding: 28,
  },
  row: {
    flexDirection: "row",
  },
  sectionTitle: {
    color: "#1b2b23",
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
  },
  tableHeader: {
    backgroundColor: "#efe5d6",
    borderBottomColor: "#cdbca3",
    borderBottomWidth: 1,
    color: "#1b2b23",
    fontSize: 10,
    fontWeight: 700,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
});

type RaceListPdfProps = {
  generatedAt: Date;
  list: ExportList;
};

function summaryLabel(list: ExportList) {
  return list.type === "PRESENCE" ? "Confirmação de presença" : "Lista de uniforme";
}

function rowsCount(list: ExportList) {
  return list.type === "PRESENCE" ? list.presenceEntries.length : list.uniformOrders.length;
}

function renderPresenceTable(list: ExportList) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={[styles.tableHeader, { width: "52%" }]}>Nome</Text>
        <Text style={[styles.tableHeader, { width: "24%" }]}>Telefone</Text>
        <Text style={[styles.tableHeader, { width: "24%" }]}>Registrado em</Text>
      </View>

      {list.presenceEntries.map((entry) => (
        <View key={entry.id} style={styles.row}>
          <Text style={[styles.cell, { width: "52%" }]}>{entry.name}</Text>
          <Text style={[styles.cell, { width: "24%" }]}>{entry.phone}</Text>
          <Text style={[styles.cell, { width: "24%" }]}>{formatDateTime(entry.createdAt)}</Text>
        </View>
      ))}
    </View>
  );
}

function renderUniformTable(list: ExportList) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={[styles.tableHeader, { width: "19%" }]}>Nome</Text>
        <Text style={[styles.tableHeader, { width: "16%" }]}>Telefone</Text>
        <Text style={[styles.tableHeader, { width: "18%" }]}>Tipo</Text>
        <Text style={[styles.tableHeader, { width: "10%" }]}>Tam.</Text>
        <Text style={[styles.tableHeader, { width: "20%" }]}>Observação</Text>
        <Text style={[styles.tableHeader, { width: "17%" }]}>Registrado em</Text>
      </View>

      {list.uniformOrders.map((order) => (
        <View key={order.id} style={styles.row}>
          <Text style={[styles.cell, { width: "19%" }]}>{order.name}</Text>
          <Text style={[styles.cell, { width: "16%" }]}>{order.phone}</Text>
          <Text style={[styles.cell, { width: "18%" }]}>{order.itemType}</Text>
          <Text style={[styles.cell, { width: "10%" }]}>{order.size}</Text>
          <Text style={[styles.cell, { width: "20%" }]}>{order.note ?? "-"}</Text>
          <Text style={[styles.cell, { width: "17%" }]}>{formatDateTime(order.createdAt)}</Text>
        </View>
      ))}
    </View>
  );
}

export function RaceListPdf({ generatedAt, list }: RaceListPdfProps) {
  return (
    <Document title={list.title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.label}>Quarteto List</Text>
          <Text style={styles.headerTitle}>{list.title}</Text>
          <Text style={styles.bodyText}>{list.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <Text style={styles.bodyText}>Tipo: {summaryLabel(list)}</Text>
          <Text style={styles.bodyText}>Gerado em: {formatDateTime(generatedAt)}</Text>
          <Text style={styles.bodyText}>Status: {list.status === "OPEN" ? "Aberta" : "Encerrada"}</Text>
          <Text style={styles.bodyText}>Registros: {rowsCount(list)}</Text>
          {list.type === "UNIFORM" && list.closeAt ? (
            <Text style={styles.bodyText}>Encerramento programado: {formatDateTime(list.closeAt)}</Text>
          ) : null}
        </View>

        <View>
          <Text style={styles.sectionTitle}>
            {list.type === "PRESENCE" ? "Participantes" : "Pedidos registrados"}
          </Text>
          {list.type === "PRESENCE" ? renderPresenceTable(list) : renderUniformTable(list)}
        </View>
      </Page>
    </Document>
  );
}