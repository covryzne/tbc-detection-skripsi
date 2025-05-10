import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconUserSearch, IconId } from "@tabler/icons-react";

interface PatientDetailsFormProps {
  onSubmit?: (data: PatientFormData) => void;
  isEditing?: boolean;
  initialData?: PatientFormData;
}

export interface PatientFormData {
  id?: string;
  name: string;
  age: string;
  gender: string;
  medicalRecordNumber?: string;
  phoneNumber?: string;
  address?: string;
  symptoms?: string;
}

export function PatientDetailsForm({
  onSubmit,
  isEditing = false,
  initialData = {
    name: "",
    age: "",
    gender: "",
    medicalRecordNumber: "",
    phoneNumber: "",
    address: "",
    symptoms: "",
  },
}: PatientDetailsFormProps) {
  const [formData, setFormData] = React.useState<PatientFormData>(initialData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUserSearch className="h-5 w-5" />
          {isEditing ? "Edit Patient Details" : "Patient Details"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Patient Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter patient name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={handleGenderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicalRecordNumber">Medical Record Number</Label>
              <div className="flex items-center">
                <div className="mr-2">
                  <IconId className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="medicalRecordNumber"
                  name="medicalRecordNumber"
                  value={formData.medicalRecordNumber}
                  onChange={handleChange}
                  placeholder="Medical record number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Patient address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms & Notes</Label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Describe symptoms and additional notes"
              className="w-full min-h-24 p-3 border rounded-md text-sm"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              {isEditing ? "Update" : "Save"} Patient Details
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
