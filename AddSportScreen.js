import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const AddSport = ({ navigation }) => {
    const [sportName, setSportName] = React.useState('');

    const handleAddSport = () => {
        if (sportName.trim() === '') {
            alert('Vui lòng nhập tên môn thể thao!');
            return;
        }
        
        // Gửi dữ liệu lên server hoặc cập nhật state
        console.log('Môn thể thao được thêm:', sportName);
        alert(`Đã thêm môn thể thao: ${sportName}`);
        setSportName('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thêm Môn Thể Thao</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập tên môn thể thao"
                value={sportName}
                onChangeText={setSportName}
            />
            <Button title="Thêm" onPress={handleAddSport} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
});

export default AddSport;
