import React from 'react';
import { useSchool } from '../../contexts/SchoolContext';

const stylePrint = `
@media print {
  /* 1. RESET BATASAN LAYAR APLIKASI */
  html, body, #root, div[class*="overflow-"], div[class*="flex-1"], div[class*="h-screen"] {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    position: static !important;
  }

  @page { 
    size: A4; 
    margin: 2.5cm 2cm 2cm 2cm; 
  }
  
  body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    background: white;
  }

  #print-section {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
  }

  table {
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  table td {
    vertical-align: top;
    padding-bottom: 2px;
  }

  /* 4. CLASS NUKLIR ANTI-POTONG */
  .signature-container {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    -webkit-column-break-inside: avoid !important;
    display: inline-block !important; /* Memaksa browser menganggap ini 1 blok solid (tak bisa dibelah) */
    width: 100%;
  }
}
`;

const PrintSuratTugas = ({ data }) => {
    const { schoolData } = useSchool();

    if (!data) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', options);
        } catch {
            return dateStr;
        }
    };

    const namaLengkap = schoolData?.nama_madrasah_lengkap || schoolData?.nama_madrasah || 'MADRASAH TSANAWIYAH NEGERI 11 TASIKMALAYA';

    return (
        <div
            id="print-section"
            className="print-only"
            style={{
                fontFamily: '"Times New Roman", Times, serif',
                color: 'black',
                background: 'white',
                width: '100%',
                fontSize: '12pt',
                lineHeight: '1.3',
                paddingTop: '0',
                marginTop: '0'
            }}>
            <style>{stylePrint}</style>

            {/* Kop Surat */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '4px double black',
                paddingBottom: '8px',
                marginBottom: '15px',
                width: '100%'
            }}>
                <div style={{ width: '100px', flexShrink: 0 }}>
                    <img
                        src="/images/logo-madrasah.png"
                        alt="Logo"
                        style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                    />
                </div>

                <div style={{
                    flex: 1,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                }}>
                    <div style={{ fontSize: '13pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                    <div style={{ fontSize: '13pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>KANTOR KEMENTERIAN AGAMA KABUPATEN TASIKMALAYA</div>
                    <div style={{ fontSize: '14pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {namaLengkap.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '9pt', marginTop: '4px' }}>
                        Alamat : {schoolData?.alamat_madrasah || 'Jalan Pasirjaya - Tanjungjaya Telp. (0265) 548519'}
                    </div>
                </div>

                <div style={{ width: '100px', flexShrink: 0 }}></div>
            </div>

            {/* Judul Surat */}
            <div style={{ textAlign: 'center', marginBottom: '20px', lineHeight: '1.2' }}>
                <div style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline' }}>SURAT TUGAS</div>
                <div style={{ fontSize: '12pt' }}>Nomor : {data.nomor_surat || ''}</div>
            </div>

            {/* Isi Surat */}
            <div style={{ textAlign: 'justify' }}>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '90px' }}>Menimbang</td>
                            <td style={{ width: '15px' }}>:</td>
                            <td style={{ width: '20px' }}>a.</td>
                            <td>Bahwa dalam rangka melaksanakan tugas untuk <strong>{data.keperluan || ''}</strong>, maka di pandang perlu untuk mengikuti kegiatan dimaksud;</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td>b.</td>
                            <td>Bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam hurup a, Nama sebagaimana tercantum dalam surat tugas ini dipandang mampu dan cakap untuk melaksanakan kegiatan dimaksud;</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td>c.</td>
                            <td>Bahwa berdasarkan pertimbangan sebagaimana dimaksud pada hurup a dan b, perlu ditertibkan surat tugas dari madrasah.</td>
                        </tr>
                    </tbody>
                </table>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '90px' }}>Dasar</td>
                            <td style={{ width: '15px' }}>:</td>
                            <td style={{ width: '20px' }}>1.</td>
                            <td>Undang-Undang Nomor 5 Tahun 2014 Tentang Aparatur Sipil Negara.</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td>2.</td>
                            <td>Peraturan Menteri Keuangan Nomor 113/PMK.05/2012 Tentang Perjalanan Dinas Dalam Negeri bagi Pejabat Negara, Pegawai Negeri, dan Pegawai Tidak Tetap.</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Memutuskan :</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '15px' }}>Memberi Tugas</div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '90px' }}>Kepada</td>
                            <td style={{ width: '15px' }}>:</td>
                            <td>
                                <table style={{ width: '100%' }}>
                                    <tbody>
                                        <tr><td style={{ width: '20px' }}>1.</td><td style={{ width: '100px' }}>Nama</td><td style={{ width: '10px' }}>:</td><td style={{ fontWeight: 'bold' }}>{data.nama || ''}</td></tr>
                                        <tr><td>2.</td><td>NIP</td><td>:</td><td>{data.nip || ''}</td></tr>
                                        <tr><td>3.</td><td>Pangkat/Gol</td><td>:</td><td>{data.pangkat_golongan || ''}</td></tr>
                                        <tr><td>4.</td><td>Jabatan</td><td>:</td><td>{data.jabatan || ''}</td></tr>
                                        <tr><td>5.</td><td>Unit Kerja</td><td>:</td><td>{data.unit_kerja || ''}</td></tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '90px' }}>Untuk</td>
                            <td style={{ width: '15px' }}>:</td>
                            <td>
                                <table style={{ width: '100%' }}>
                                    <tbody>
                                        <tr><td style={{ width: '20px' }}>1.</td><td style={{ width: '100px' }}>Keperluan</td><td style={{ width: '10px' }}>:</td><td style={{ textAlign: 'justify' }}>{data.keperluan || ''}</td></tr>
                                        <tr><td>2.</td><td>Hari, Tanggal</td><td>:</td><td>{data.hari_tanggal || ''}</td></tr>
                                        <tr><td>3.</td><td>Waktu</td><td>:</td><td>{data.waktu || ''}</td></tr>
                                        <tr><td>4.</td><td>Tempat</td><td>:</td><td>{data.tempat || ''}</td></tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* TABEL TANDA TANGAN FINAL - Dijamin Utuh & Sejajar */}
            <div className="signature-container" style={{ marginTop: '30px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '55%' }}></td> {/* Kolom kosong didorong lebih lebar (55%) */}
                            <td style={{ width: '45%', textAlign: 'left' }}> {/* Kolom tanda tangan 45% (cukup untuk nama panjang) */}
                                <div style={{ marginBottom: '4px' }}>{data.kota_surat || 'Tasikmalaya'}, {formatDate(data.tanggal_surat)}</div>
                                <div style={{ marginBottom: '60px' }}>Kepala,</div>

                                {/* whiteSpace: nowrap memaksa nama agar tidak turun ke bawah/membelah sejajar lurus */}
                                <div style={{ fontWeight: 'bold', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                                    {data.kepala_madrasah || schoolData?.nama_kepala_madrasah || ''}
                                </div>

                                <div>NIP. {data.nip_kepala || schoolData?.nip_kepala_madrasah || ''}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default PrintSuratTugas;