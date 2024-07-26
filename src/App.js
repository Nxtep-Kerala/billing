import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  PDFDownloadLink,
} from "@react-pdf/renderer";
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
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SaveIcon from "@mui/icons-material/Save";
import headerImage from "./images/header.png";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import db from "./firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: "Arial",
    h4: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
  },
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 12,
    padding: 30,
    color: "#333",
    backgroundColor: "#fff"
  },
  headerText: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: "left",
    fontWeight: "bold",
    color: "#000",
  },
  sectionHeader: {
    fontSize: 12,
    marginVertical: 5,
    textAlign: "left",
    fontWeight: "bold",
    color: "#000",
  },
  details: {
    marginBottom: 10,
    padding: 5,
    borderRadius: 5,
  },
  detailText: {
    fontSize: 12,
    marginVertical: 1,
    color: "#000"
  },
  InvoiceMain: {  
    marginTop: 8,
    marginBottom: 20
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row"
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#A783EE"
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 12,
    fontWeight: 500
  },
  tableCell: {
    margin: 5,
    fontSize: 10
  },
  total: {
    fontSize: 14,
    marginTop: 10,
    textAlign: "right",
    fontWeight: "bold",
    color: "#000"
  },
  line: {
    position: 'absolute',   
    bottom: 35,             
    left: 10,               
    right: 10,              
    height: 2,             
    backgroundColor: "#A783EE", 
  },
  thanks: {
    position: 'absolute',
    bottom: 10,            
    width: '100%',
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
    color: "#000"
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 5,
  },
  totalInWords: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

const numberToWords = (num) => {
  const under20 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (num < 20) return under20[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? '-' + under20[num % 10] : '');
  if (num < 1000) return under20[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  return 'Number too large';
};

const InvoicePDF = ({ items, discountPercentage, billTo, invoiceNumber }) => {
  const total = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const discount = total * (discountPercentage / 100);
  const finalTotal = total - discount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image style={styles.headerImage} src={headerImage} />
        <View style={styles.InvoiceMain}>
          <Text style={styles.headerText}>Invoice Number: {invoiceNumber}</Text>
          <Text style={styles.headerText}>
            Date: {new Date().toLocaleDateString()}
          </Text>
        </View>
        
        <Text style={styles.sectionHeader}>Bill to:</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>
            <Text style={{ fontWeight: 'bold' }}>{billTo.name}</Text> ,
          </Text>
          <Text style={styles.detailText}>
            {billTo.address},
          </Text>
          <Text style={styles.detailText}>
            {billTo.email},
          </Text>
          <Text style={styles.detailText}>
            {billTo.phone}.
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: "10%" }]}>
              <Text style={styles.tableCellHeader}>S.No</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "40%" }]}>
              <Text style={styles.tableCellHeader}>Item</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "15%" }]}>
              <Text style={styles.tableCellHeader}>Quantity</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "15%" }]}>
              <Text style={styles.tableCellHeader}>Price</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "20%" }]}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "10%" }]}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              <View style={[styles.tableCol, { width: "40%" }]}>
                <Text style={styles.tableCell}>{item.name}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}>{item.price.toFixed(2)}</Text>
              </View>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text style={styles.tableCell}>
                  {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "65%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCellHeader}>Total:</Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}>{total.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "65%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCellHeader}>Discount:</Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}>{discountPercentage}% ({discount.toFixed(2)})</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "65%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCellHeader}>Final Total:</Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}>{finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.totalInWords}>Total in Words: {numberToWords(Math.floor(finalTotal))} Rupee only</Text>
        
        <View style={styles.line}></View>
        <Text style={styles.thanks}>Thank You for your Business!</Text>
      </Page>
    </Document>
  );
};



const InvoiceApp = () => {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [billTo, setBillTo] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  const [invoiceNumber] = useState(`INV${new Date().getTime()}`);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, []);

  const fetchClients = async () => {
    const clientsCollection = collection(db, "clients");
    const clientSnapshot = await getDocs(clientsCollection);
    const clientList = clientSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClients(clientList);
  };

  const fetchInvoices = async () => {
    const invoicesCollection = collection(db, "invoices");
    const invoiceSnapshot = await getDocs(invoicesCollection);
    const invoiceList = invoiceSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setInvoices(invoiceList);
  };
  const handleAddItem = () => {
    if (!item || price <= 0 || quantity <= 0) {
      setOpenSnackbar(true);
      return;
    }
    const newItem = {
      name: item,
      price: parseFloat(price),
      quantity: parseInt(quantity),
    };
    setItems([...items, newItem]);
    setItem("");
    setPrice("");
    setQuantity(1);
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
      createdAt: new Date(),
    };
    try {
      await addDoc(collection(db, "invoices"), invoiceData);
      alert("Invoice saved successfully!");
      fetchInvoices();
    } catch (error) {
      console.error("Error saving invoice: ", error);
      alert("Failed to save invoice.");
    }
  };

  const saveClientDetails = async () => {
    try {
      if (editingClient) {
        await updateDoc(doc(db, "clients", editingClient.id), billTo);
        alert("Client details updated successfully!");
      } else {
        await addDoc(collection(db, "clients"), billTo);
        alert("Client details saved successfully!");
      }
      fetchClients();
      setOpenClientDialog(false);
      setEditingClient(null);
      setBillTo({ name: "", address: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error saving client details: ", error);
      alert("Failed to save client details.");
    }
  };

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    setSelectedClient(clientId);
    const selectedClient = clients.find((client) => client.id === clientId);
    if (selectedClient) {
      setBillTo(selectedClient);
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await deleteDoc(doc(db, "clients", clientId));
      alert("Client deleted successfully!");
      fetchClients();
    } catch (error) {
      console.error("Error deleting client: ", error);
      alert("Failed to delete client.");
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setBillTo(client);
    setOpenClientDialog(true);
  };

  const handleCloseClientDialog = () => {
    setOpenClientDialog(false);
    setEditingClient(null);
    setBillTo({ name: "", address: "", email: "", phone: "" });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Invoice Generator
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Select Client"
                  value={selectedClient}
                  onChange={handleClientSelect}
                  variant="outlined"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bill To Name"
                  value={billTo.name}
                  onChange={(e) =>
                    setBillTo({ ...billTo, name: e.target.value })
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bill To Address"
                  value={billTo.address}
                  onChange={(e) =>
                    setBillTo({ ...billTo, address: e.target.value })
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={billTo.email}
                  onChange={(e) =>
                    setBillTo({ ...billTo, email: e.target.value })
                  }
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
                  onChange={(e) =>
                    setBillTo({ ...billTo, phone: e.target.value })
                  }
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
                  onChange={(e) => setItem(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Price "
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleAddItem}
                  color="primary"
                  sx={{ mt: 2 }}
                >
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
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price </TableCell>
                      <TableCell align="right">Total </TableCell>
                      <TableCell align="right">Delete</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          ₹{item.price.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => handleDeleteItem(index)}
                            color="error"
                          >
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
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={saveInvoiceToFirebase}
                  startIcon={<SaveIcon />}
                  fullWidth
                >
                  Save Invoice
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenClientDialog(true)}
                  startIcon={<SaveIcon />}
                  fullWidth
                >
                  Manage Clients
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenInvoiceDialog(true)}
                  fullWidth
                >
                  View Invoices
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenInvoiceDialog(true)}
                  fullWidth
                >
                  <PDFDownloadLink
                    document={
                      <InvoicePDF
                        items={items}
                        discountPercentage={discountPercentage}
                        billTo={billTo}
                        invoiceNumber={invoiceNumber}
                      />
                    }
                    fileName="invoice.pdf"
                  >
                    {({ blob, url, loading, error }) =>
                      loading ? "Loading document..." : "Download now!"
                    }
                  </PDFDownloadLink>{" "}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Dialog open={openClientDialog} onClose={handleCloseClientDialog}>
          <DialogTitle>
            {editingClient ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={billTo.name}
              onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Address"
              value={billTo.address}
              onChange={(e) =>
                setBillTo({ ...billTo, address: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={billTo.email}
              onChange={(e) => setBillTo({ ...billTo, email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              value={billTo.phone}
              onChange={(e) => setBillTo({ ...billTo, phone: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseClientDialog}>Cancel</Button>
            <Button onClick={saveClientDetails} color="primary">
              Save
            </Button>
          </DialogActions>
          <DialogContent>
            <Typography variant="h6">Client List</Typography>
            <List>
              {clients.map((client) => (
                <ListItem key={client.id}>
                  <ListItemText
                    primary={client.name}
                    secondary={client.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEditClient(client)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
        <Dialog
          open={openInvoiceDialog}
          onClose={() => setOpenInvoiceDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Previous Invoices</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Client Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.billTo.name}</TableCell>
                      <TableCell>
                        {new Date(
                          invoice.createdAt.seconds * 1000
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        ₹
                        {invoice.items
                          .reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          )
                          .toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenInvoiceDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="error"
            sx={{ width: "100%" }}
          >
            Please enter valid item name, price, and quantity.
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default InvoiceApp;
