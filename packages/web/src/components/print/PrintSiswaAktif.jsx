import React from 'react';
import { useSchool } from '../../contexts/SchoolContext';

const stylePrint = `
@media print {
  @page { 
    size: A4; 
    margin: 1cm 2cm; 
  }
  body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
  }
  #print-section {
    display: block !important;
    height: auto !important;
    min-height: 297mm;
    overflow: visible !important;
  }
}
`;

const PrintSiswaAktif = ({ data }) => {
    const { schoolData } = useSchool();

    if (!data) return null;

    // Helper 1: Format Tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', options);
        } catch {
            return dateStr;
        }
    };

    // Helper 2: Mengubah KAPITAL menjadi Title Case (Untuk Isi Surat)
    const toTitleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };

    // Ambil data dari field baru atau fallback ke data lama jika belum diisi
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
                minHeight: '297mm',
                height: 'auto',
                overflow: 'visible',
                paddingTop: '0',
                marginTop: '0'
            }}>
            <style>{stylePrint}</style>

            {/* Kop Surat */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '4px double black',
                paddingBottom: '10px',
                marginBottom: '20px',
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
                    {/* MENGGUNAKAN NAMA LENGKAP (KAPITAL) DI KOP */}
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
            <div style={{ textAlign: 'center', marginBottom: '30px', lineHeight: '1.2' }}>
                <div style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline' }}>SURAT KETERANGAN SISWA AKTIF</div>
                <div style={{ fontSize: '12pt' }}>Nomor: {data.nomor_surat || data.letterNumber || ''}</div>
            </div>

            {/* Isi Surat */}
            <div style={{ fontSize: '12pt', lineHeight: '1.5', textAlign: 'justify' }}>
                <p style={{ textIndent: '40px', marginBottom: '15px' }}>
                    {/* MENGGUNAKAN TITLE CASE DI ISI SURAT */}
                    Yang bertanda tangan di bawah ini Kepala {toTitleCase(namaLengkap)}, menerangkan dengan sebenarnya bahwa:
                </p>

                <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '200px', padding: '2px 0', paddingLeft: '40px' }}>Nama</td>
                            <td style={{ width: '10px', padding: '2px 0' }}>:</td>
                            <td style={{ padding: '2px 0', fontWeight: 'bold' }}>{data.nama || ''}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '2px 0', paddingLeft: '40px' }}>Tempat, Tanggal Lahir</td>
                            <td style={{ padding: '2px 0' }}>:</td>
                            <td style={{ padding: '2px 0' }}>{data.tempat_lahir || ''}, {formatDate(data.tgl_lahir)}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '2px 0', paddingLeft: '40px' }}>NISN</td>
                            <td style={{ padding: '2px 0' }}>:</td>
                            <td style={{ padding: '2px 0' }}>{data.nisn || ''}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '2px 0', paddingLeft: '40px' }}>Kelas</td>
                            <td style={{ padding: '2px 0' }}>:</td>
                            <td style={{ padding: '2px 0' }}>{data.kelas || ''}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '2px 0', paddingLeft: '40px' }}>Nama Orang Tua/Wali</td>
                            <td style={{ padding: '2px 0' }}>:</td>
                            <td style={{ padding: '2px 0' }}>{data.nama_orangtua || ''}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '2px 0', paddingLeft: '40px', verticalAlign: 'top' }}>Alamat</td>
                            <td style={{ padding: '2px 0', verticalAlign: 'top' }}>:</td>
                            <td style={{ padding: '2px 0', verticalAlign: 'top' }}>{data.alamat || ''}</td>
                        </tr>
                    </tbody>
                </table>

                <p style={{ textIndent: '40px', marginBottom: '15px' }}>
                    {/* MENGGUNAKAN TITLE CASE DI PARAGRAF BAWAH */}
                    Adalah benar siswa tersebut di atas merupakan siswa aktif di {toTitleCase(namaLengkap)} pada Tahun Pelajaran <strong>{data.tahun_pelajaran || ''}</strong>.
                </p>

                <p style={{ textIndent: '40px', marginBottom: '40px' }}>
                    Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
                </p>
            </div>

            {/* Tanda Tangan */}
            <div className="signature-wrapper" style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12pt', lineHeight: '1.5', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ width: '300px', textAlign: 'left' }}>
                    <div>{data.kota_surat || data.tempat_surat || ''}, {formatDate(data.tanggal_surat || data.date)}</div>
                    <div style={{ marginBottom: '80px' }}>Kepala Madrasah,</div>
                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{schoolData?.nama_kepala_madrasah || data.nama_kepala || ''}</div>
                    <div>NIP. {schoolData?.nip_kepala_madrasah || data.nip_kepala || ''}</div>
                </div>
            </div>
        </div>
    );
};

export default PrintSiswaAktif;