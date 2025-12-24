'use client';

import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

type ReportData = {
  campaignName: string;
  date: string;
  stats: {
    total: number;
    success: number;
    failed: number;
    economySaved: string;
  };
  contacts: {
    name: string;
    phone: string;
    status: string;
  }[];
};

// Register fonts
Font.register({
    family: 'Inter',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', fontWeight: 500 },
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', fontWeight: 700 },
    ],
  });

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    padding: 30,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingBottom: 10,
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#25D366',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  economyCard: {
    backgroundColor: '#dcfce7',
    padding: 15,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  economyText: {
    fontSize: 12,
    marginBottom: 4,
  },
  economyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#eaeaea',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '33.33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: '#f8f8f8',
    padding: 5,
    fontWeight: 'bold',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#eaeaea',
    padding: 5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  statusSuccess: {
    color: '#16a34a',
  },
  statusFailed: {
    color: '#dc2626',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#aaa',
  },
});

export const CampaignPDF = ({ data }: { data: ReportData }) => (
  <Document
    title={`Relatório - ${data.campaignName}`}
    author="WhatsConnect"
    subject="Relatório de Campanha"
  >
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.logo}>WhatsConnect</Text>
        <Text style={styles.headerTitle}>Relatório de Disparo</Text>
      </View>

      <View>
        <Text style={{ fontSize: 12, marginBottom: 4 }}>Campanha: {data.campaignName}</Text>
        <Text style={{ fontSize: 10, color: '#666', marginBottom: 15 }}>Data de Envio: {data.date}</Text>
      </View>

      <View style={styles.economyCard}>
        <Text style={styles.economyText}>Economia Total nesta Campanha</Text>
        <Text style={styles.economyValue}>R$ {data.stats.economySaved}</Text>
      </View>

      <View style={styles.statsContainer}>
          <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.stats.total}</Text>
              <Text style={styles.statLabel}>Total de Envios</Text>
          </View>
          <View style={styles.statBox}>
              <Text style={{...styles.statValue, color: '#16a34a'}}>{data.stats.success}</Text>
              <Text style={styles.statLabel}>Sucesso</Text>
          </View>
          <View style={styles.statBox}>
              <Text style={{...styles.statValue, color: '#dc2626'}}>{data.stats.failed}</Text>
              <Text style={styles.statLabel}>Falhas</Text>
          </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Nome</Text>
          <Text style={styles.tableColHeader}>Telefone</Text>
          <Text style={styles.tableColHeader}>Status</Text>
        </View>
        {data.contacts.map((contact, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCol}>{contact.name}</Text>
            <Text style={styles.tableCol}>{contact.phone}</Text>
            <Text style={{...styles.tableCol, ...(contact.status === 'Sucesso' ? styles.statusSuccess : styles.statusFailed)}}>
              {contact.status}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Relatório gerado por WhatsConnect em {new Date().toLocaleDateString('pt-BR')}
      </Text>
    </Page>
  </Document>
);
