import React, { useState } from 'react';
import { RoomMeasurement, RoomDimension } from '../types'; // Fixed import path
import { Ruler, Calculator, Plus } from 'lucide-react';
import styled from 'styled-components';

// ... rest of the component remains the same
const Container = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.h2`
  color: #050505ff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Form = styled.form`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: 600;
  color: #000000ff;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #181818ff;
  border-radius: 4px;
  font-size: 16px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #212020ff;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 15px;
  background: #d90e0eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    background: #d31414ff;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background: #34495e;
  color: white;
  padding: 12px;
  text-align: left;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const MeasurementCard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #2c3e50;
`;

const CardValue = styled.p`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #3498db;
`;

const RoomMeasurementComponent: React.FC = () => {
    const [roomMeasurements, setRoomMeasurements] = useState<RoomMeasurement[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        length: '',
        width: '',
        height: '',
        unit: 'feet' as 'feet' | 'meters'
    });

    const calculateArea = (length: number, width: number): number => {
        return length * width;
    };

    const calculateVolume = (length: number, width: number, height: number): number => {
        return length * width * height;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const length = parseFloat(formData.length);
        const width = parseFloat(formData.width);
        const height = parseFloat(formData.height);

        if (isNaN(length) || isNaN(width) || isNaN(height) || length <= 0 || width <= 0 || height <= 0) {
            alert('Please enter valid dimensions');
            return;
        }

        const area = calculateArea(length, width);
        const volume = calculateVolume(length, width, height);

        const newMeasurement: RoomMeasurement = {
            id: Date.now().toString(),
            name: formData.name,
            dimensions: {
                length,
                width,
                height,
                unit: formData.unit
            },
            area,
            volume
        };

        setRoomMeasurements([...roomMeasurements, newMeasurement]);
        setFormData({
            name: '',
            length: '',
            width: '',
            height: '',
            unit: 'feet'
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Container>
            <Header>
                <Ruler size={24} />
                Room Measurement
            </Header>

            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label>Room Name</Label>
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Length</Label>
                    <Input
                        type="number"
                        name="length"
                        value={formData.length}
                        onChange={handleChange}
                        min="0.1"
                        step="0.1"
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Width</Label>
                    <Input
                        type="number"
                        name="width"
                        value={formData.width}
                        onChange={handleChange}
                        min="0.1"
                        step="0.1"
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Height</Label>
                    <Input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        min="0.1"
                        step="0.1"
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Unit</Label>
                    <Select name="unit" value={formData.unit} onChange={handleChange}>
                        <option value="feet">Feet</option>
                        <option value="meters">Meters</option>
                    </Select>
                </FormGroup>

                <Button type="submit">
                    <Plus size={16} />
                    Add
                </Button>
            </Form>

            {roomMeasurements.map(room => (
                <div key={room.id}>
                    <h3>{room.name} Measurements</h3>
                    <MeasurementCard>
                        <Card>
                            <CardTitle>Area</CardTitle>
                            <CardValue>
                                {room.area.toFixed(2)} {room.dimensions.unit === 'feet' ? 'sq ft' : 'sq m'}
                            </CardValue>
                        </Card>

                        <Card>
                            <CardTitle>Volume</CardTitle>
                            <CardValue>
                                {room.volume.toFixed(2)} {room.dimensions.unit === 'feet' ? 'cu ft' : 'cu m'}
                            </CardValue>
                        </Card>

                        <Card>
                            <CardTitle>Dimensions</CardTitle>
                            <CardValue>
                                {room.dimensions.length} × {room.dimensions.width} × {room.dimensions.height} {room.dimensions.unit}
                            </CardValue>
                        </Card>
                    </MeasurementCard>
                </div>
            ))}

            {roomMeasurements.length > 0 && (
                <Table>
                    <thead>
                        <tr>
                            <TableHeader>Room Name</TableHeader>
                            <TableHeader>Dimensions</TableHeader>
                            <TableHeader>Area</TableHeader>
                            <TableHeader>Volume</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {roomMeasurements.map(room => (
                            <TableRow key={room.id}>
                                <TableCell>{room.name}</TableCell>
                                <TableCell>
                                    {room.dimensions.length} × {room.dimensions.width} × {room.dimensions.height} {room.dimensions.unit}
                                </TableCell>
                                <TableCell>
                                    {room.area.toFixed(2)} {room.dimensions.unit === 'feet' ? 'sq ft' : 'sq m'}
                                </TableCell>
                                <TableCell>
                                    {room.volume.toFixed(2)} {room.dimensions.unit === 'feet' ? 'cu ft' : 'cu m'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default RoomMeasurementComponent;