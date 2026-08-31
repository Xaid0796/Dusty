// src/types/biodata.ts
// Data model for the Matrimonial Biodata Generator

export interface BiodataPhotoHeading {
    photoUrl?: string;
    originalPhotoUrl?: string;
    heading: string;
}

export interface BiodataPersonal {
    fullName: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
    height: string;
    complexion: string;
    bloodGroup: string;
    maritalStatus: string;
    diet: string;
    religion: string;
    caste: string;
    gotra: string;
    rashi: string;
    nakshatra: string;
    manglik: string;
    education: string;
    occupation: string;
    income: string;
    hobbies: string;
}

export interface BiodataFamily {
    fatherName: string;
    fatherOccupation: string;
    motherName: string;
    motherOccupation: string;
    siblings: string;
    familyType: string;
    familyValues: string;
    nativePlace: string;
}

export interface BiodataContact {
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
}

export interface BiodataStyle {
    templateId: 'classic' | 'modern' | 'floral';
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    accentColor?: string;
}

export interface BiodataDocument {
    id: string;
    name?: string;
    photoHeading: BiodataPhotoHeading;
    personal: BiodataPersonal;
    family: BiodataFamily;
    contact: BiodataContact;
    style: BiodataStyle;
}

export const COMPLEXION_OPTIONS = [
    'Fair',
    'Wheatish',
    'Wheatish Medium',
    'Wheatish Brown',
    'Dark',
];

export const BLOOD_GROUP_OPTIONS = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
];

export const MARITAL_STATUS_OPTIONS = [
    'Never Married',
    'Divorced',
    'Widowed',
    'Awaiting Divorce',
];

export const DIET_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'];

export const MANGALIK_OPTIONS = ['No', 'Yes', 'Partial Manglik', 'Angarak'];

export const FAMILY_TYPE_OPTIONS = ['Joint', 'Nuclear', 'Extended'];

export const FAMILY_VALUES_OPTIONS = [
    'Traditional',
    'Moderate',
    'Liberal',
    'Orthodox',
];

export const HEADING_OPTIONS = [
    'Biodata',
    'Matrimonial Biodata',
    'Marriage Biodata',
    'Personal Biodata',
];
