import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

type PaymentScreenProps = {
  route: {
    params: {
      price: number;
      total: number;
    };
  };
};

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route }) => {
  const { price, total } = route.params;

  const handlePayment = () => {
    Alert.alert('Payment Successful', 'Thank you for your purchase!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment Summary</Text>
      
      <View style={styles.summaryContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Item Price:</Text>
          <Text style={styles.value}>${price.toFixed(2)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Service Fee:</Text>
          <Text style={styles.value}>$1.00</Text>
        </View>
        
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <Button
        title="Confirm Payment"
        onPress={handlePayment}
        color="#FFA500"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  summaryContainer: {
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
  },
});

export default PaymentScreen;
