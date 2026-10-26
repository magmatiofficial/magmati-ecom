'use client';

/**
 * @file components/returns/ReturnImageUploader.tsx
 * @description Required invoice and product photo uploader grid with upload status for the return form.
 */
import React from 'react';
import Image from 'next/image';
import { CheckCircle2, AlertCircle, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ReturnImageUploaderProps {
  uploadedImages: string[];
  isUploading: boolean;
  uploadError: string | null;
  handleMultipleImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  handleRemoveUploadedImage: (indexToRemove: number) => void;
}

export function ReturnImageUploader({ uploadedImages, isUploading, uploadError, handleMultipleImagesUpload, handleRemoveUploadedImage }: ReturnImageUploaderProps) {
  return (
    <>
                    {/* REQUIRED Returns Image Uploader (Direct Cloudinary Integration) */}
                    <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                      <div>
                        <span className="text-sm font-semibold text-zinc-850 block flex items-center gap-1.5 mb-1">
                          <ImageIcon className="w-4 h-4 text-primary" />
                          <span>
                            {'Upload Invoice & Product Damage Photos (Required):'}
                          </span>
                        </span>
                        <span className="text-2xs text-zinc-500 leading-none mt-1 block">
                          {'• Take a clear shot of invoice next to the damaged item (Up to 5 images)'}
                        </span>
                      </div>

                      {/* Upload grid list */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {uploadedImages.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden group">
                            <Image
                              src={url}
                              alt="Return attachment"
                              fill
                              sizes="120px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveUploadedImage(idx)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-red-600/90 text-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100 duration-200"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Upload trigger button if < 5 */}
                        {uploadedImages.length < 5 && (
                          <label className={`aspect-square rounded-2xl border-2 border-dashed border-zinc-300 hover:border-primary bg-zinc-50/50 hover:bg-primary/5 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                            isUploading ? 'pointer-events-none' : ''
                          }`}>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleMultipleImagesUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <LoadingSpinner size="sm" text={'Uploading...'} />
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-zinc-400 group-hover:text-primary mb-1.5 shrink-0" />
                                <span className="text-2xs font-black text-zinc-500 uppercase tracking-wider block">
                                  {'Add Photo'}
                                </span>
                                <span className="text-2xs text-zinc-400 mt-0.5">
                                  {uploadedImages.length}/5 uploaded
                                </span>
                              </>
                            )}
                          </label>
                        )}
                      </div>

                      {uploadError && (
                        <p className="text-2xs text-rose-600 font-semibold mt-1">
                          ⚠️ {uploadError}
                        </p>
                      )}

                      {/* Display image requirement status */}
                      <div className="p-3.5 rounded-xl border flex items-center gap-2.5 mt-2 transition-colors duration-200 bg-zinc-50 border-zinc-200">
                        {uploadedImages.length > 0 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-semibold text-emerald-800">
                              {`Verification photo attached (${uploadedImages.length} images added)`}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-xs font-semibold text-primary">
                              {'Uploading at least one invoice/product photo is mandatory to submit return request.'}
                            </span>
                          </>
                        )}
                      </div>

                    </div>
    </>
  );
}
