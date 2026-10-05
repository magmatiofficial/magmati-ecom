'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, User as UserIcon, Phone, Bookmark, CheckCircle2, Home, Briefcase, Building, Plus, X, Star } from 'lucide-react';
import { INSIDE_DHAKA_DELIVERY_FEE_BDT, OUTSIDE_DHAKA_DELIVERY_FEE_BDT } from '@/lib/constants';
import { BANGLADESH_DISTRICTS } from '@/lib/bangladeshDistricts';
import { SavedAddress, useAuthStore } from '@/store/useAuthStore';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface CheckoutDeliveryFormProps {
  
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  selectedDistrict: string;
  handleDistrictChange: (districtId: string) => void;
  customerAddress: string;
  setCustomerAddress: (v: string) => void;
  orderNotes: string;
  setOrderNotes: (v: string) => void;
  deliveryArea: 'inside' | 'outside';
  setDeliveryArea: (area: 'inside' | 'outside') => void;
  insideDhakaFee: number;
  outsideDhakaFee: number;
  formatBDT: (amount: number) => string;
  savedAddresses?: SavedAddress[];
}

export const CheckoutDeliveryForm: React.FC<CheckoutDeliveryFormProps> = ({
    customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  selectedDistrict,
  handleDistrictChange,
  customerAddress,
  setCustomerAddress,
  orderNotes,
  setOrderNotes,
  deliveryArea,
  setDeliveryArea,
  insideDhakaFee,
  outsideDhakaFee,
  formatBDT,
  savedAddresses = [],
}) => {
  const { addSavedAddress } = useAuthStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Modal for adding a new address directly on Checkout page
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('Home');
  const [newRecipientName, setNewRecipientName] = useState(customerName || '');
  const [newPhone, setNewPhone] = useState(customerPhone || '');
  const [newDistrictId, setNewDistrictId] = useState('dhaka');
  const [newAddress, setNewAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync selected address ID on load or when savedAddresses change
  useEffect(() => {
    if (savedAddresses.length > 0) {
      if (!selectedAddressId || !savedAddresses.some((a) => a.id === selectedAddressId)) {
        const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
        if (defaultAddr) {
          handleSelectSavedAddress(defaultAddr);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddresses]);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    if (addr.recipientName) setCustomerName(addr.recipientName);
    if (addr.phone) setCustomerPhone(addr.phone);
    if (addr.address) setCustomerAddress(addr.address);
    if (addr.districtId) handleDistrictChange(addr.districtId);
  };

  const openAddModal = () => {
    setTitle('Home');
    setNewRecipientName(customerName || '');
    setNewPhone(customerPhone || '');
    setNewDistrictId(selectedDistrict || 'dhaka');
    setNewAddress('');
    setIsDefault(savedAddresses.length === 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Address title label is required.');
      return;
    }
    if (!newRecipientName.trim()) {
      setFormError('Recipient name is required.');
      return;
    }
    if (!newPhone.trim()) {
      setFormError('Mobile phone is required.');
      return;
    }
    if (!newAddress.trim()) {
      setFormError('Detailed address is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      recipientName: newRecipientName.trim(),
      phone: newPhone.trim(),
      districtId: newDistrictId,
      address: newAddress.trim(),
      isDefault,
    };

    await addSavedAddress(payload);

    // Apply immediately to current checkout fields
    setCustomerName(payload.recipientName);
    setCustomerPhone(payload.phone);
    setCustomerAddress(payload.address);
    handleDistrictChange(payload.districtId);

    setIsModalOpen(false);
  };

  const getTitleIcon = (titleText: string) => {
    const lower = (titleText || '').toLowerCase();
    if (lower.includes('home') || lower.includes('residence')) {
      return <Home className="w-3.5 h-3.5" />;
    }
    if (lower.includes('office') || lower.includes('work') || lower.includes('hq')) {
      return <Briefcase className="w-3.5 h-3.5" />;
    }
    return <Building className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 p-5 sm:p-6 shadow-xs space-y-4 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
        <h2 className="font-sans text-base font-bold text-text-main flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{'Delivery Address & Recipient'}</span>
        </h2>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{'+ Add Address'}</span>
        </button>
      </div>

      {/* Prominent Saved Addresses Selection Cards */}
      {savedAddresses.length > 0 && (
        <div className="space-y-2 font-sans">
          <div className="flex items-center justify-between">
            <span className="text-eyebrow font-bold text-zinc-700 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-secondary" />
              <span>
                {`Select Delivery Location (${savedAddresses.length}):`}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              const districtObj = BANGLADESH_DISTRICTS.find((d) => d.id === addr.districtId);
              const districtLabel = districtObj ? districtObj.nameEn : 'Dhaka';

              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative font-sans flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-2xs'
                      : 'border-zinc-200/90 bg-zinc-50 hover:bg-zinc-100/80 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-2xs font-extrabold uppercase ${isSelected ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-800'}`}>
                        {getTitleIcon(addr.title)}
                        <span>{addr.title}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {addr.isDefault && (
                          <span className="text-2xs px-1.5 py-0.2 rounded font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Default</span>
                          </span>
                        )}
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                    </div>

                    <div className="text-xs font-bold text-zinc-900 truncate">{addr.recipientName}</div>
                    <div className="text-2xs text-zinc-500 font-mono">{addr.phone}</div>
                    <div className="text-2xs text-zinc-700 line-clamp-2 mt-1 pt-1 border-t border-zinc-200/60">
                      <span className="font-semibold text-zinc-900">{districtLabel}:</span> {addr.address}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <div className="space-y-3 font-sans pt-1">
        {/* Recipient Full Name */}
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1 font-sans">
            {'Full Name *'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setSelectedAddressId(null);
              }}
              placeholder="e.g. Asif Rahman"
              className="w-full h-10 px-3 pl-8 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary font-sans"
            />
            <UserIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Mobile Phone Number */}
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1 font-sans">
            {'Active Mobile Phone (11 digits) *'}
          </label>
          <div className="relative">
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                setSelectedAddressId(null);
              }}
              placeholder="01712345678"
              className="w-full h-10 px-3 pl-8 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary font-sans font-mono"
            />
            <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-2xs text-zinc-400 mt-0.5 block font-sans">
            {'We will call this number prior to delivery'}
          </span>
        </div>

        {/* 64 Districts Selector */}
        <div className="space-y-1.5">
          <CustomDropdown
            label="Select Your District *"
            value={selectedDistrict}
            onChange={(val) => {
              handleDistrictChange(val);
              setSelectedAddressId(null);
            }}
            options={BANGLADESH_DISTRICTS.map((d) => ({
              value: d.id,
              label: `${d.nameEn} ${d.isDhakaCity ? `(Dhaka City - ৳${INSIDE_DHAKA_DELIVERY_FEE_BDT})` : `(Outside Dhaka - ৳${OUTSIDE_DHAKA_DELIVERY_FEE_BDT})`}`,
            }))}
            triggerClassName="h-10"
          />
        </div>

        {/* Street & Area Address */}
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1 font-sans">
            {'Detailed Delivery Address *'}
          </label>
          <textarea
            rows={2}
            value={customerAddress}
            onChange={(e) => {
              setCustomerAddress(e.target.value);
              setSelectedAddressId(null);
            }}
            placeholder="e.g. House 14, Road 5, Block C, Banani / Mirpur 10, Dhaka"
            className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary resize-none font-sans"
          />
        </div>

        {/* Optional Delivery Instructions */}
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1 font-sans">
            {'Delivery Instructions / Notes (Optional)'}
          </label>
          <input
            type="text"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder={'e.g. Call before arrival / Deliver after 2 PM'}
            className="w-full h-9 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary font-sans"
          />
        </div>

        {/* Delivery Location Area Selection */}
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1.5 font-sans">
            {'Delivery Zone & Rates'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryArea('inside')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                deliveryArea === 'inside'
                  ? 'bg-secondary text-white border-secondary shadow-xs'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <div className="leading-tight font-sans">{'Inside Dhaka'}</div>
              <div className="text-2xs opacity-80 mt-0.5 font-sans">
                {formatBDT(insideDhakaFee)} ({'1-2 Days'})
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryArea('outside')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                deliveryArea === 'outside'
                  ? 'bg-secondary text-white border-secondary shadow-xs'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <div className="leading-tight font-sans">{'Outside Dhaka'}</div>
              <div className="text-2xs opacity-80 mt-0.5 font-sans">
                {formatBDT(outsideDhakaFee)} ({'2-3 Days'})
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Add New Address Modal directly on Checkout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative font-sans space-y-4 max-h-[90dvh] overflow-y-auto text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{'Add New Delivery Address'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium font-sans">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddNewAddressSubmit} className="space-y-4">
              {/* Address Label Title */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5 font-sans">
                  {'Address Tag / Label *'}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Home', 'Office', "Parents' House", 'Factory'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTitle(tag)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        title === tag
                          ? 'bg-secondary text-white border-secondary shadow-2xs'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Home, Office, Farmhouse"
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary font-sans"
                />
              </div>

              {/* Recipient Full Name */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1 font-sans">
                  {'Recipient Full Name *'}
                </label>
                <input
                  type="text"
                  value={newRecipientName}
                  onChange={(e) => setNewRecipientName(e.target.value)}
                  placeholder="e.g. Asif Rahman"
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary font-sans"
                />
              </div>

              {/* Active Mobile Phone */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1 font-sans">
                  {'Mobile Phone Number *'}
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary font-sans font-mono"
                />
              </div>

              {/* District Dropdown */}
              <div className="space-y-1.5">
                <CustomDropdown
                  label="Select District *"
                  value={newDistrictId}
                  onChange={setNewDistrictId}
                  options={BANGLADESH_DISTRICTS.map((d) => ({
                    value: d.id,
                    label: `${d.nameEn} ${d.isDhakaCity ? `(Dhaka City - ৳${INSIDE_DHAKA_DELIVERY_FEE_BDT})` : `(Outside Dhaka - ৳${OUTSIDE_DHAKA_DELIVERY_FEE_BDT})`}`,
                  }))}
                  triggerClassName="h-10"
                />
              </div>

              {/* Detailed Address */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1 font-sans">
                  {'Detailed Delivery Address *'}
                </label>
                <textarea
                  rows={3}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. House 24, Road 11, Block D, Banani, Dhaka"
                  className="w-full p-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary resize-none font-sans"
                />
              </div>

              {/* Set Default Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <span className="text-xs font-bold text-zinc-800 font-sans">
                  {'Set as primary default delivery address'}
                </span>
              </label>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  {'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
