// Official Kemenkop hackathon database schema — alignment layer.
//
// Source: hackathon/metadata_database_hackathon_final.xlsx (27 tables, 58
// relationships). NALAR's demo data mirrors these table/field names and IDs so
// the dashboard reads like it runs on the real Kemenkop database. This module
// documents the mapping and drives the "Sumber Data" lineage panel.

/** The 27 official tables (for the coverage/lineage panel). */
export const OFFICIAL_TABLES = [
    "profil_koperasi", "referensi_koperasi_wilayah", "referensi_wilayah",
    "gerai_koperasi", "referensi_gerai_koperasi", "produk_koperasi",
    "inventaris_produk", "barang_masuk_produk", "barang_keluar_produk",
    "transaksi_penjualan", "karyawan_koperasi", "pengurus_koperasi",
    "anggota_koperasi", "simpanan_anggota", "rat_koperasi", "aset_koperasi",
    "modal_koperasi", "akun_bank_koperasi", "kbli_koperasi", "dokumen_koperasi",
    "referensi_dokumen_koperasi", "referensi_komoditas_desa",
    "referensi_profil_desa", "pengajuan_domain", "pengajuan_kemitraan",
    "pengajuan_pembiayaan", "pengajuan_rekening_bank",
] as const;

/** Tables NALAR actively consumes for its analytics (the retail-usaha core). */
export const NALAR_SOURCE_TABLES = [
    "transaksi_penjualan", "barang_keluar_produk", "barang_masuk_produk",
    "produk_koperasi", "inventaris_produk", "karyawan_koperasi",
    "gerai_koperasi", "profil_koperasi", "referensi_wilayah",
] as const;

/** Enum values taken verbatim from the metadata "Example Data" column. */
export const ENUM = {
    status_transaksi: ["Paid", "Unpaid", "Refund"],
    metode_pembayaran: ["Tunai", "QRIS", "Transfer"],
    status_barang_keluar: ["Sales"],
    status_barang_masuk: ["Approved", "Requested"],
    status_gerai: ["Aktif", "Belum Aktif"],
    bentuk_koperasi: ["Primer", "Sekunder"],
    jabatan: ["Direktur", "Manajer", "Kasir", "Sales", "Staf Gudang"],
} as const;

/** Data lineage: which official tables/joins produce each NALAR metric.
 *  Shown to judges to prove the analytics map to the real schema. */
export interface Lineage {
    metrik: string;
    sumber: string; // human-readable join expression
    kunci: string; // join key
}

export const LINEAGE: Lineage[] = [
    {
        metrik: "Total Penjualan & Transaksi",
        sumber: "transaksi_penjualan ⋈ barang_keluar_produk",
        kunci: "transaksi_sample_id",
    },
    {
        metrik: "Margin Kotor",
        sumber: "barang_keluar_produk.harga − barang_masuk_produk.harga_beli",
        kunci: "produk_sample_id",
    },
    {
        metrik: "Detail Barang Terjual (SKU)",
        sumber: "barang_keluar_produk ⋈ produk_koperasi",
        kunci: "produk_sample_id",
    },
    {
        metrik: "Rekomendasi Restock",
        sumber: "inventaris_produk.stok ÷ laju barang_keluar_produk",
        kunci: "produk_sample_id",
    },
    {
        metrik: "Performa per Sales",
        sumber: "barang_keluar_produk ⋈ karyawan_koperasi (jabatan=Sales)",
        kunci: "karyawan_ref",
    },
    {
        metrik: "Sebaran Wilayah & Profil",
        sumber: "profil_koperasi ⋈ referensi_koperasi_wilayah ⋈ referensi_wilayah",
        kunci: "koperasi_ref · kode_wilayah",
    },
];

/** Human map of NALAR concept → official field, for the mapping doc/tooltips. */
export const FIELD_MAP: Record<string, string> = {
    "Koperasi": "profil_koperasi.koperasi_ref / nama_koperasi",
    "Gerai": "gerai_koperasi.gerai_ref",
    "Sales / Kasir": "karyawan_koperasi.karyawan_ref (jabatan)",
    "Produk": "produk_koperasi.produk_sample_id / kode_barcode / unit",
    "Stok": "inventaris_produk.stok",
    "Harga beli / jual": "barang_masuk_produk.harga_beli / harga_jual",
    "Transaksi (header)": "transaksi_penjualan.transaksi_sample_id",
    "Item terjual (baris)": "barang_keluar_produk.jumlah_keluar / harga / total_nilai",
    "Metode bayar": "transaksi_penjualan.metode_pembayaran",
    "Status transaksi": "transaksi_penjualan.status_transaksi (Paid)",
    "Wilayah": "referensi_wilayah.kode_wilayah",
};
