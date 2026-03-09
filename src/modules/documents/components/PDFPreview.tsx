import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
  signature: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: 200,
    paddingTop: 5,
    textAlign: 'center',
  }
});

interface DocumentProps {
  title: string;
  content: string;
  protocolNumber: string;
  date: string;
  author: string;
  isSigned?: boolean;
  signatureData?: string;
}

// Componente Documento PDF
const PROCONDocument = ({ title, content, protocolNumber, date, author, isSigned, signatureData }: DocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>PROCON - Defesa do Consumidor</Text>
        <Text style={styles.text}>Protocolo: {protocolNumber}</Text>
        <Text style={styles.text}>Data: {date}</Text>
        
        <Text style={styles.subheader}>{title}</Text>
        <Text style={styles.text}>{content}</Text>

        <View style={{ marginTop: 50 }}>
          <Text style={styles.text}>Atenciosamente,</Text>
          <Text style={styles.text}>{author}</Text>
        </View>

        {isSigned && (
          <View style={styles.section}>
            <Text style={{ fontSize: 10, color: 'green' }}>
              Documento Assinado Digitalmente (ICP-Brasil)
            </Text>
            <Text style={{ fontSize: 8, color: 'grey' }}>
              Hash: {signatureData ? signatureData.substring(0, 32) + '...' : 'N/A'}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.footer}>
        Sistema de Gestão PROCON - Documento gerado eletronicamente.
      </Text>
    </Page>
  </Document>
);

interface PDFPreviewProps extends DocumentProps {
  height?: string | number;
}

export const PDFPreview: React.FC<PDFPreviewProps> = (props) => {
  return (
    <div style={{ width: '100%', height: props.height || '600px' }}>
      <PDFViewer width="100%" height="100%">
        <PROCONDocument {...props} />
      </PDFViewer>
    </div>
  );
};

export default PDFPreview;
