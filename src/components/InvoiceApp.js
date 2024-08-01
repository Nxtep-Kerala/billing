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
import { Box, CardHeader } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import GetAppIcon from "@mui/icons-material/GetApp";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import db from "../firebase-config";
import headerImage from "../images/header.png";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
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
    fontSize: 14,
    padding: 30,
    color: "#333",
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: "left",
    fontWeight: "bold",
    color: "#000",
  },
  sectionHeader: {
    fontSize: 14,
    marginVertical: 5,
    textAlign: "left",
    fontWeight: "bold",
    color: "#000",
  },
  details: {
    marginBottom: 15,
    padding: 5,
    borderRadius: 5,
  },
  detailText: {
    fontSize: 14,
    marginVertical: 1,
    color: "#000",
  },
  InvoiceMain: {
    marginTop: 16,
    marginBottom: 20,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#A783EE",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 14,
    fontWeight: 500,
  },
  tableCell: {
    margin: 5,
    fontSize: 12,
  },
  total: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "right",
    fontWeight: "bold",
    color: "#000",
  },
  line: {
    position: "absolute",
    bottom: 35,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: "#A783EE",
  },
  thanks: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
  footer: {
    fontSize: 14,
    position: "absolute",
    display: "flex",
    justifycontent: "center",
    alignitems: "center",
    bottom: 20,
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 5,
  },
  totalInWords: {
    fontSize: 14,
    marginTop: 15,
    fontStyle: "italic",
  },
  bold: {
    fontWeight: "bold",
  },
});

const numberToWords = (num) => {
  const units = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const scales = ["", "thousand", "lakh", "crore"];

  const convertLessThanOneThousand = (n) => {
    if (n === 0) return "";
    if (n < 20) return units[n];
    const digit = n % 10;
    if (n < 100)
      return tens[Math.floor(n / 10)] + (digit ? "-" + units[digit] : "");
    return (
      units[Math.floor(n / 100)] +
      " hundred" +
      (n % 100 ? " and " + convertLessThanOneThousand(n % 100) : "")
    );
  };

  const convert = (n, scaleIndex) => {
    if (n === 0) return "";
    const lessThanOneThousand = convertLessThanOneThousand(n % 1000);
    const rest = Math.floor(n / 1000);
    let result =
      lessThanOneThousand +
      (lessThanOneThousand ? " " + scales[scaleIndex] : "");
    if (rest > 0) {
      if (scaleIndex === 1) {
        // For thousands
        result = convert(rest, scaleIndex + 1) + (result ? " " + result : "");
      } else {
        result =
          convert(rest % 100, scaleIndex + 1) + (result ? " " + result : "");
        if (rest >= 100) {
          result =
            convert(Math.floor(rest / 100), scaleIndex + 2) +
            (result ? " " + result : "");
        }
      }
    }
    return result;
  };

  if (num === 0) return "Zero";
  return convert(num, 0);
};

const InvoicePDF = ({ items, discountPercentage, billTo, invoiceNumber }) => {
  const total = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const discount = discountPercentage ? total * (discountPercentage / 100) : 0;
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
            <Text style={styles.bold}>{billTo.name}</Text> ,
          </Text>
          <Text style={styles.detailText}>{billTo.address},</Text>
          <Text style={styles.detailText}>{billTo.email},</Text>
          <Text style={styles.detailText}>{billTo.phone}.</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: "10%" }]}>
              <Text style={styles.tableCellHeader}>Sl no.</Text>
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
          {discountPercentage > 0 && (
            <>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "65%" }]}>
                  <Text style={styles.tableCell}></Text>
                </View>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text style={styles.tableCellHeader}>Discount:</Text>
                </View>
                <View style={[styles.tableCol, { width: "20%" }]}>
                  <Text style={styles.tableCell}>
                    {discountPercentage}% ({discount.toFixed(2)})
                  </Text>
                </View>
              </View>
            </>
          )}

          {finalTotal !== total && (
            <>
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
            </>
          )}
        </View>

        <Text style={styles.totalInWords}>
          Total amount to be paid is {numberToWords(Math.floor(finalTotal))} Rupees only
        </Text>

        <View style={styles.line}></View>
        <Text style={styles.thanks}>Thank you for choosing us!</Text>
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
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setOpenInvoiceDialog(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setItems(invoice.items);
    setBillTo(invoice.billTo);
    setDiscountPercentage(invoice.discountPercentage);
    setInvoiceNumber(invoice.invoiceNumber);
    setOpenInvoiceDialog(false);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await deleteDoc(doc(db, "invoices", invoiceId));
      alert("Invoice deleted successfully!");
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice: ", error);
      alert("Failed to delete invoice.");
    }
  };

  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return;

    const updatedInvoiceData = {
      items,
      discountPercentage,
      billTo,
      invoiceNumber: editingInvoice.invoiceNumber,
      createdAt: editingInvoice.createdAt,
      updatedAt: new Date(),
    };

    try {
      await updateDoc(doc(db, "invoices", editingInvoice.id), updatedInvoiceData);
      alert("Invoice updated successfully!");
      fetchInvoices();
      setEditingInvoice(null);
      resetForm();
    } catch (error) {
      console.error("Error updating invoice: ", error);
      alert("Failed to update invoice.");
    }
  };

  const resetForm = () => {
    setItems([]);
    setBillTo({ name: "", address: "", email: "", phone: "" });
    setDiscountPercentage(0);
    setInvoiceNumber("");
    setSelectedClient("");
  };

  useEffect(() => {
    fetchClients();
    fetchInvoices();
    generateInvoiceNumber();
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

  const generateInvoiceNumber = async () => {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = String(currentDate.getFullYear()).slice(-2); // Get last 2 digits of the year
    const baseInvoiceNumber = `${month}${year}`;

    const invoicesCollection = collection(db, "invoices");
    const q = query(
      invoicesCollection,
      where("invoiceNumber", ">=", baseInvoiceNumber + "001"),
      where("invoiceNumber", "<", baseInvoiceNumber + "999"),
      orderBy("invoiceNumber", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    let serialNumber = 1;

    if (!querySnapshot.empty) {
      const lastInvoice = querySnapshot.docs[0].data();
      serialNumber = parseInt(lastInvoice.invoiceNumber.slice(4)) + 1;
    }

    const newInvoiceNumber = `${baseInvoiceNumber}${String(
      serialNumber
    ).padStart(3, "0")}`;
    setInvoiceNumber(newInvoiceNumber);
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
      generateInvoiceNumber(); // Generate new invoice number for the next invoice
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
        <Container maxWidth="md">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" gutterBottom align="center" color="primary">
              Invoice Generator
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardHeader title="Client Information" />
                <CardContent>
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
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardHeader title="Item Details" />
                <CardContent>
                  <Grid container spacing={2}>
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
                        label="Price"
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
                        color="secondary"
                        fullWidth
                        startIcon={<AddIcon />}
                      >
                        Add Item
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
    
          {items.length > 0 && (
            <Card sx={{ mt: 3 }} elevation={3}>
              <CardHeader title="Invoice Items" />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>S.No</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                          <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() => handleDeleteItem(index)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
    
    <Box sx={{ mt: 2 }}>
  <Grid container spacing={2} justifyContent="space-between">
    <Grid item xs={12} sm={6} md={3}>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={editingInvoice ? handleUpdateInvoice : saveInvoiceToFirebase}
        startIcon={<SaveIcon />}
      >
        {editingInvoice ? "Update Invoice" : "Save Invoice"}
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button
        fullWidth
        variant="outlined"
        color="primary"
        onClick={() => setOpenClientDialog(true)}
        startIcon={<PeopleIcon />}
      >
        Manage Clients
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button
        fullWidth
        variant="outlined"
        color="primary"
        onClick={() => setOpenInvoiceDialog(true)}
        startIcon={<ReceiptIcon />}
      >
        View Invoices
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <PDFDownloadLink
        document={
          <InvoicePDF
            items={items}
            discountPercentage={discountPercentage}
            billTo={billTo}
            invoiceNumber={invoiceNumber}
          />
        }
        fileName={`INV${invoiceNumber}.pdf`}
      >
        {({ blob, url, loading, error }) => (
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<GetAppIcon />}
            disabled={loading}
          >
            {loading ? "Generating PDF..." : "Download PDF"}
          </Button>
        )}
      </PDFDownloadLink>
    </Grid>
  </Grid>
</Box>
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
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.billTo.name}</TableCell>
                      <TableCell>
                        {new Date(invoice.createdAt.seconds * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        ₹
                        {invoice.items
                          .reduce((total, item) => total + item.price * item.quantity, 0)
                          .toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleViewInvoice(invoice)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton onClick={() => handleEditInvoice(invoice)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteInvoice(invoice.id)}>
                          <DeleteIcon />
                        </IconButton>
                        <PDFDownloadLink
                          document={
                            <InvoicePDF
                              items={invoice.items}
                              discountPercentage={invoice.discountPercentage}
                              billTo={invoice.billTo}
                              invoiceNumber={invoice.invoiceNumber}
                            />
                          }
                          fileName={`INV${invoice.invoiceNumber}.pdf`}
                        >
                          {({ blob, url, loading, error }) => (
                            <IconButton disabled={loading}>
                              <GetAppIcon />
                            </IconButton>
                          )}
                        </PDFDownloadLink>
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

        {/* Add a new Dialog for viewing a single invoice */}
        <Dialog
          open={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogContent>
            {selectedInvoice && (
              <>
                <Typography variant="h6">Invoice Number: {selectedInvoice.invoiceNumber}</Typography>
                <Typography>Client: {selectedInvoice.billTo.name}</Typography>
                <Typography>Date: {new Date(selectedInvoice.createdAt.seconds * 1000).toLocaleDateString()}</Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                          <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="h6" align="right" sx={{ mt: 2 }}>
                  Total: ₹
                  {selectedInvoice.items
                    .reduce((total, item) => total + item.price * item.quantity, 0)
                    .toFixed(2)}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedInvoice(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Add a cancel button when editing */}
        {editingInvoice && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setEditingInvoice(null);
              resetForm();
            }}
            fullWidth
            sx={{ mt: 2 }}
          >
            Cancel Editing
          </Button>
        )}
        

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
