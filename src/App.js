import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer';
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SaveIcon from '@mui/icons-material/Save';
import headerImage from './images/header.png';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import db from './firebase-config';
import { collection, addDoc } from 'firebase/firestore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Arial',
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 30,
    color: '#333',
  },
  headerImage: {
    width: '100%',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 14,
    marginVertical: 10,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  details: {
    marginBottom: 20,
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 5,
  },
  detailText: {
    fontSize: 12,
    marginVertical: 2,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderCollapse: 'collapse',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '33.33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f3f3f3',
    fontWeight: 600,
    padding: 5,
    textAlign: 'center',
  },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    textAlign: 'center',
  },
  tableCell: {
    margin: 5,
    fontSize: 12,
  },
  total: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  thanks: {
    marginTop: 20,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  line: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 10,
    marginBottom: 10,
  }
});

const InvoicePDF = ({ items, discountPercentage, billTo, invoiceNumber }) => {
  const total = items.reduce((total, item) => total + item.price, 0);
  const discount = total * (discountPercentage / 100);
  const finalTotal = total - discount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image style={styles.headerImage} src={headerImage} />
        <Text style={styles.headerText}>Invoice Number: {invoiceNumber}</Text>
        <Text style={styles.headerText}>Date: {new Date().toLocaleDateString()}</Text>
        <Text style={styles.sectionHeader}>Bill to:</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}><strong>Name:</strong> {billTo.name}</Text>
          <Text style={styles.detailText}><strong>Address:</strong> {billTo.address}</Text>
          <Text style={styles.detailText}><strong>Email:</strong> {billTo.email}</Text>
          <Text style={styles.detailText}><strong>Phone:</strong> {billTo.phone}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCell}>S.No</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCell}>Item</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCell}>Price</Text></View>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{index + 1}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.price.toFixed(2)}</Text></View>
            </View>
          ))}
        </View>
        <View style={styles.line} />
        <Text style={styles.total}>Total: {total.toFixed(2)}</Text>
        <Text style={styles.total}>Discount: {discountPercentage}% ({discount.toFixed(2)})</Text>
        <Text style={styles.total}>Final Total: {finalTotal.toFixed(2)} Rupees only</Text>
        <Text style={styles.thanks}>Thank You for your Business!</Text>
      </Page>
    </Document>
  );
};

const InvoiceApp = () => {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [billTo, setBillTo] = useState({ name: '', address: '', email: '', phone: '' });
  const [invoiceNumber] = useState(`INV${new Date().getTime()}`);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleAddItem = () => {
    if (!item || price <= 0) {
      setOpenSnackbar(true);
      return;
    }
    const newItem = { name: item, price: parseFloat(price) };
    setItems([...items, newItem]);
    setItem('');
    setPrice('');
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handleDeleteItem = (indexToDelete) => {
    setItems(items.filter((_, index) => index !== indexToDelete));
  };

  const saveInvoiceToFirebase = async () => {
    const invoiceData = {
      items,
      discountPercentage,
      billTo,
      invoiceNumber,
      createdAt: new Date()
    };
    try {
      await addDoc(collection(db, 'invoices'), invoiceData);
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Error saving invoice: ', error);
      alert('Failed to save invoice.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>Invoice Generator</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bill To Name"
                  value={billTo.name}
                  onChange={e => setBillTo({ ...billTo, name: e.target.value })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bill To Address"
                  value={billTo.address}
                  onChange={e => setBillTo({ ...billTo, address: e.target.value })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={billTo.email}
                  onChange={e => setBillTo({ ...billTo, email: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={billTo.phone}
                  onChange={e => setBillTo({ ...billTo, phone: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Name"
                  value={item}
                  onChange={e => setItem(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  type="number"
                  value={discountPercentage}
                  onChange={e => setDiscountPercentage(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleAddItem} color="primary" sx={{ mt: 2 }}>
                  Add Item
                </Button>
              </Grid>
            </Grid>
            {items.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>S.No</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Price (₹)</TableCell>
                      <TableCell align="right">Delete</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleDeleteItem(index)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={saveInvoiceToFirebase}
                  startIcon={<SaveIcon />}
                  fullWidth
                >
                  Save to Firebase
                </Button>
              </Grid>
              <Grid item xs={6}>
                <PDFDownloadLink
                  document={<InvoicePDF items={items} discountPercentage={discountPercentage} billTo={billTo} invoiceNumber={invoiceNumber} />}
                  fileName={`invoice-${invoiceNumber}.pdf`}
                >
                  <Button variant="contained" color="primary" fullWidth>
                    Download Invoice
                  </Button>
                </PDFDownloadLink>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            Please enter valid item name and price.
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default InvoiceApp;
