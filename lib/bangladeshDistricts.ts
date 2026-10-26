/**
 * @file lib/bangladeshDistricts.ts
 * @description Complete list of all 64 districts of Bangladesh with bilingual support
 * and automated inside/outside Dhaka shipping zone resolution.
 */

export interface District {
  id: string;
  nameEn: string;
  isDhakaDivision: boolean;
  isDhakaCity: boolean;
}

export const BANGLADESH_DISTRICTS: District[] = [
  { id: 'barguna', nameEn: 'Barguna', isDhakaDivision: false, isDhakaCity: false },
  { id: 'barishal', nameEn: 'Barishal', isDhakaDivision: false, isDhakaCity: false },
  { id: 'bhola', nameEn: 'Bhola', isDhakaDivision: false, isDhakaCity: false },
  { id: 'jhalokati', nameEn: 'Jhalokati', isDhakaDivision: false, isDhakaCity: false },
  { id: 'patuakhali', nameEn: 'Patuakhali', isDhakaDivision: false, isDhakaCity: false },
  { id: 'pirojpur', nameEn: 'Pirojpur', isDhakaDivision: false, isDhakaCity: false },
  { id: 'bandarban', nameEn: 'Bandarban', isDhakaDivision: false, isDhakaCity: false },
  { id: 'brahmanbaria', nameEn: 'Brahmanbaria', isDhakaDivision: false, isDhakaCity: false },
  { id: 'chandpur', nameEn: 'Chandpur', isDhakaDivision: false, isDhakaCity: false },
  { id: 'chattogram', nameEn: 'Chattogram', isDhakaDivision: false, isDhakaCity: false },
  { id: 'cumilla', nameEn: 'Cumilla', isDhakaDivision: false, isDhakaCity: false },
  { id: 'coxsbazar', nameEn: 'Cox\'s Bazar', isDhakaDivision: false, isDhakaCity: false },
  { id: 'feni', nameEn: 'Feni', isDhakaDivision: false, isDhakaCity: false },
  { id: 'khagrachhari', nameEn: 'Khagrachhari', isDhakaDivision: false, isDhakaCity: false },
  { id: 'lakshmipur', nameEn: 'Lakshmipur', isDhakaDivision: false, isDhakaCity: false },
  { id: 'noakhali', nameEn: 'Noakhali', isDhakaDivision: false, isDhakaCity: false },
  { id: 'rangamati', nameEn: 'Rangamati', isDhakaDivision: false, isDhakaCity: false },
  { id: 'dhaka', nameEn: 'Dhaka', isDhakaDivision: true, isDhakaCity: true },
  { id: 'faridpur', nameEn: 'Faridpur', isDhakaDivision: true, isDhakaCity: false },
  { id: 'gazipur', nameEn: 'Gazipur', isDhakaDivision: true, isDhakaCity: false },
  { id: 'gopalganj', nameEn: 'Gopalganj', isDhakaDivision: true, isDhakaCity: false },
  { id: 'kishoreganj', nameEn: 'Kishoreganj', isDhakaDivision: true, isDhakaCity: false },
  { id: 'madaripur', nameEn: 'Madaripur', isDhakaDivision: true, isDhakaCity: false },
  { id: 'manikganj', nameEn: 'Manikganj', isDhakaDivision: true, isDhakaCity: false },
  { id: 'munshiganj', nameEn: 'Munshiganj', isDhakaDivision: true, isDhakaCity: false },
  { id: 'narayanganj', nameEn: 'Narayanganj', isDhakaDivision: true, isDhakaCity: false },
  { id: 'narsingdi', nameEn: 'Narsingdi', isDhakaDivision: true, isDhakaCity: false },
  { id: 'rajbari', nameEn: 'Rajbari', isDhakaDivision: true, isDhakaCity: false },
  { id: 'shariatpur', nameEn: 'Shariatpur', isDhakaDivision: true, isDhakaCity: false },
  { id: 'tangail', nameEn: 'Tangail', isDhakaDivision: true, isDhakaCity: false },
  { id: 'bagerhat', nameEn: 'Bagerhat', isDhakaDivision: false, isDhakaCity: false },
  { id: 'chuadanga', nameEn: 'Chuadanga', isDhakaDivision: false, isDhakaCity: false },
  { id: 'jashore', nameEn: 'Jashore', isDhakaDivision: false, isDhakaCity: false },
  { id: 'jhenaidah', nameEn: 'Jhenaidah', isDhakaDivision: false, isDhakaCity: false },
  { id: 'khulna', nameEn: 'Khulna', isDhakaDivision: false, isDhakaCity: false },
  { id: 'kushtia', nameEn: 'Kushtia', isDhakaDivision: false, isDhakaCity: false },
  { id: 'magura', nameEn: 'Magura', isDhakaDivision: false, isDhakaCity: false },
  { id: 'meherpur', nameEn: 'Meherpur', isDhakaDivision: false, isDhakaCity: false },
  { id: 'narail', nameEn: 'Narail', isDhakaDivision: false, isDhakaCity: false },
  { id: 'satkhira', nameEn: 'Satkhira', isDhakaDivision: false, isDhakaCity: false },
  { id: 'jamalpur', nameEn: 'Jamalpur', isDhakaDivision: false, isDhakaCity: false },
  { id: 'mymensingh', nameEn: 'Mymensingh', isDhakaDivision: false, isDhakaCity: false },
  { id: 'netrokona', nameEn: 'Netrokona', isDhakaDivision: false, isDhakaCity: false },
  { id: 'sherpur', nameEn: 'Sherpur', isDhakaDivision: false, isDhakaCity: false },
  { id: 'bogura', nameEn: 'Bogura', isDhakaDivision: false, isDhakaCity: false },
  { id: 'joypurhat', nameEn: 'Joypurhat', isDhakaDivision: false, isDhakaCity: false },
  { id: 'naogaon', nameEn: 'Naogaon', isDhakaDivision: false, isDhakaCity: false },
  { id: 'natore', nameEn: 'Natore', isDhakaDivision: false, isDhakaCity: false },
  { id: 'chapainawabganj', nameEn: 'Chapai Nawabganj', isDhakaDivision: false, isDhakaCity: false },
  { id: 'pabna', nameEn: 'Pabna', isDhakaDivision: false, isDhakaCity: false },
  { id: 'rajshahi', nameEn: 'Rajshahi', isDhakaDivision: false, isDhakaCity: false },
  { id: 'sirajganj', nameEn: 'Sirajganj', isDhakaDivision: false, isDhakaCity: false },
  { id: 'dinajpur', nameEn: 'Dinajpur', isDhakaDivision: false, isDhakaCity: false },
  { id: 'gaibandha', nameEn: 'Gaibandha', isDhakaDivision: false, isDhakaCity: false },
  { id: 'kurigram', nameEn: 'Kurigram', isDhakaDivision: false, isDhakaCity: false },
  { id: 'lalmonirhat', nameEn: 'Lalmonirhat', isDhakaDivision: false, isDhakaCity: false },
  { id: 'nilphamari', nameEn: 'Nilphamari', isDhakaDivision: false, isDhakaCity: false },
  { id: 'panchagarh', nameEn: 'Panchagarh', isDhakaDivision: false, isDhakaCity: false },
  { id: 'rangpur', nameEn: 'Rangpur', isDhakaDivision: false, isDhakaCity: false },
  { id: 'thakurgaon', nameEn: 'Thakurgaon', isDhakaDivision: false, isDhakaCity: false },
  { id: 'habiganj', nameEn: 'Habiganj', isDhakaDivision: false, isDhakaCity: false },
  { id: 'moulvibazar', nameEn: 'Moulvibazar', isDhakaDivision: false, isDhakaCity: false },
  { id: 'sunamganj', nameEn: 'Sunamganj', isDhakaDivision: false, isDhakaCity: false },
  { id: 'sylhet', nameEn: 'Sylhet', isDhakaDivision: false, isDhakaCity: false },
];
