'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, CheckCircle2, Home, Briefcase, Building, Star, X, Phone, User as UserIcon } from 'lucide-react';
import { User, SavedAddress, useAuthStore } from '@/store/useAuthStore';
import { BANGLADESH_DISTRICTS } from '@/lib/bangladeshDistricts';
import { INSIDE_DHAKA_DELIVERY_FEE_BDT, OUTSIDE_DHAKA_DELIVERY_FEE_BDT } from '@/lib/constants';

interface CustomerAddressesTabProps {
  
  currentUser: User;
  setActiveTab: (tab: any) => void;
}

export const CustomerAddressesTab: React.FC<CustomerAddressesTabProps> = ({
    currentUser,
  setActiveTab,
}) => {
  const { addSavedAddress, updateSavedAddress, deleteSavedAddress, setDefaultAddress } = useAuthStore();

  // Address Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Form inputs
  const [title, setTitle] = useState('Home');
  const [recipientName, setRecipientName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [districtId, setDistrictId] = useState('dhaka');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get addresses list with fallback
  const addresses: SavedAddress[] = (currentUser.savedAddresses && currentUser.savedAddresses.length > 0)
    ? currentUser.savedAddresses
    : currentUser.address
    ? [{
        id: 'default-fallback',
        title: 'Home Address',
        recipientName: currentUser.name || 'Valued Customer',
        phone: currentUser.phone || '',
        districtId: 'dhaka',
        address: currentUser.address,
        isDefault: true,
      }]
    : [];

  const openAddModal = () => {
    setEditingAddress(null);
    setTitle('Home');
    setRecipientName(currentUser.name || '');
    setPhone(currentUser.phone || '');
    setDistrictId('dhaka');
    setAddress('');
    setIsDefault(addresses.length === 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setTitle(addr.title || 'Home');
    setRecipientName(addr.recipientName || currentUser.name || '');
    setPhone(addr.phone || currentUser.phone || '');
    setDistrictId(addr.districtId || 'dhaka');
    setAddress(addr.address || '');
    setIsDefault(Boolean(addr.isDefault));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Address title is required.');
      return;
    }
    if (!recipientName.trim()) {
      setFormError('Recipient name is required.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Mobile phone number is required.');
      return;
    }
    if (!address.trim()) {
      setFormError('Detailed address is required.');
      return;
    }

    setFormError(null);

    const payload = {
      title: title.trim(),
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      districtId,
      address: address.trim(),
      isDefault,
    };

    if (editingAddress) {
      await updateSavedAddress(editingAddress.id, payload);
    } else {
      await addSavedAddress(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteSavedAddress(id);
    setDeletingId(null);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
  };

  const getTitleIcon = (titleText: string) => {
    const lower = (titleText || '').toLowerCase();
    if (lower.includes('home')) {
      return <Home className="w-3.5 h-3.5" />;
    }
    if (lower.includes('office') || lower.includes('work')) {
      return <Briefcase className="w-3.5 h-3.5" />;
    }
    return <Building className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div>
          <h2 className="font-sans text-lg font-bold text-text-main flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>{'Saved Delivery Addresses'}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-sans">
            {'Manage multiple addresses for effortless express checkout.'}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{'Add New Address'}</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-zinc-600 font-sans">
            {'You have no saved delivery addresses yet.'}
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors font-sans cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{'Add Your First Address'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const districtObj = BANGLADESH_DISTRICTS.find((d) => d.id === addr.districtId);
            const districtLabel = districtObj ? districtObj.nameEn : 'Dhaka';

            return (
              <div
                key={addr.id}
                className={`bg-white rounded-3xl border-2 p-5 shadow-xs relative font-sans transition-all flex flex-col justify-between ${
                  addr.isDefault ? 'border-secondary ring-2 ring-secondary/10' : 'border-zinc-200/90 hover:border-zinc-300'
                }`}
              >
                <div>
                  {/* Top Header Line */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-bold font-sans">
                      {getTitleIcon(addr.title)}
                      <span>{addr.title}</span>
                    </span>

                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-white text-2xs font-extrabold uppercase tracking-wider font-sans shadow-2xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{'DEFAULT'}</span>
                      </span>
                    )}
                  </div>

                  {/* Address Info Body */}
                  <div className="space-y-1.5 mb-4">
                    <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{addr.recipientName}</span>
                    </h3>

                    <p className="text-xs text-zinc-500 font-mono flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{addr.phone}</span>
                    </p>

                    <p className="text-xs text-zinc-700 leading-relaxed font-sans pt-1 border-t border-zinc-100 mt-2">
                      <span className="font-semibold text-zinc-900">{districtLabel}:</span> {addr.address}
                    </p>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-auto">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-2xs font-bold text-secondary hover:underline font-sans cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                      <span>{'Set as Default'}</span>
                    </button>
                  ) : (
                    <span className="text-2xs font-bold text-zinc-400 font-sans flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>{'Default Address'}</span>
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title={'Edit Address'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingId(addr.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={'Delete Address'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 custom-scrollbar">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative font-sans flex flex-col max-h-[85dvh] sm:max-h-[88dvh] overflow-hidden my-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>
                  {editingAddress
                    ? 'Edit Delivery Address'
                    : 'Add New Delivery Address'}
                </span>
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
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium font-sans my-2 shrink-0">
                {formError}
              </div>
            )}

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar space-y-4 py-2 pr-1 min-h-0">
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
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary font-sans font-mono"
                />
              </div>

              {/* District Dropdown */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1 font-sans">
                  {'Select District *'}
                </label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary font-sans font-medium text-zinc-900 cursor-pointer"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameEn}{' '}
                      {d.isDhakaCity
                        ? `(Dhaka City - ৳${INSIDE_DHAKA_DELIVERY_FEE_BDT})`
                        : `(Outside Dhaka - ৳${OUTSIDE_DHAKA_DELIVERY_FEE_BDT})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed Address */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1 font-sans">
                  {'Detailed Delivery Address *'}
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  {'Set as primary / default delivery address'}
                </span>
              </label>

              {/* Modal Fixed Footer Action Bar */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 shrink-0 bg-white sticky bottom-0 mt-2">
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
                  {editingAddress
                    ? 'Update Address'
                    : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative font-sans text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 font-sans">
              {'Delete Saved Address?'}
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              {'This delivery address will be permanently removed from your account.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                {'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
