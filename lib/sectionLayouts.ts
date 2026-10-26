export const RETIRED_SECTION_IDS = ['combo_products', 'buy1_get1'];

export function stripRetiredSections<T extends Record<string, unknown>>(data: T): T {
  if (!data || !Array.isArray(data.sectionLayouts)) {
    return data;
  }
  return {
    ...data,
    sectionLayouts: (data.sectionLayouts as any[]).filter(
      (sec) => !RETIRED_SECTION_IDS.includes(sec.id)
    ),
  };
}
