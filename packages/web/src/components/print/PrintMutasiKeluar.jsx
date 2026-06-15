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
    background: white;
  }
  /* KUNCI UTAMA: Memaksa halaman baru */
  .page-break {
    page-break-after: always;
    break-after: page;
  }
  /* Reset margin untuk setiap halaman baru agar rapi */
  .page-container {
    min-height: 297mm;
    height: auto;
    position: relative;
    padding-top: 10px; 
    box-sizing: border-box;
  }
  table td {
    vertical-align: top;
  }
}
`;

const PrintMutasiKeluar = ({ data }) => {
    const { schoolData } = useSchool();

    if (!data) return null;

    // Helper: Format Tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', options);
        } catch {
            return dateStr;
        }
    };

    // Helper: Title Case
    const toTitleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };

    const namaLengkap = schoolData?.nama_madrasah_lengkap || schoolData?.nama_madrasah || 'MADRASAH TSANAWIYAH NEGERI 11 TASIKMALAYA';
    const namaTitleCase = toTitleCase(namaLengkap);

    // Komponen Reusable untuk Kop Surat (Agar tidak menulis ulang di Lembar 2 & 3)
    const KopSurat = () => (
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '4px double black', paddingBottom: '10px', marginBottom: '20px', width: '100%' }}>
            <div style={{ width: '100px', flexShrink: 0 }}>
                <img src="/images/logo-madrasah.png" alt="Logo" style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '13pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                <div style={{ fontSize: '13pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>KANTOR KEMENTERIAN AGAMA KABUPATEN TASIKMALAYA</div>
                <div style={{ fontSize: '14pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{namaLengkap.toUpperCase()}</div>
                <div style={{ fontSize: '9pt', marginTop: '4px' }}>
                    Alamat : {schoolData?.alamat_madrasah || 'Jalan Pasirjaya - Tanjungjaya Telp. (0265) 548519 Tasikmalaya 46185'}
                </div>
            </div>
            <div style={{ width: '100px', flexShrink: 0 }}></div>
        </div>
    );

    return (
        <div id="print-section" className="print-only" style={{ fontFamily: '"Times New Roman", Times, serif', color: 'black', background: 'white', width: '100%', fontSize: '12pt', lineHeight: '1.5' }}>
            <style>{stylePrint}</style>

            {/* ==================== LEMBAR 1: PERMOHONAN PINDAH ==================== */}
            <div className="page-container page-break">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', marginTop: '20px' }}>
                    <div>
                        <div>Hal : <strong>PERMOHONAN PINDAH</strong></div>
                    </div>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                        <div>Kepada Yth.</div>
                        <div>Kepala {namaTitleCase}</div>
                        <div>di</div>
                        <div style={{ paddingLeft: '20px' }}>Tempat</div>
                    </div>
                </div>

                <div style={{ textAlign: 'justify' }}>
                    <p>Dengan hormat,</p>
                    <p style={{ marginBottom: '10px' }}>Yang bertanda tangan di bawah ini :</p>
                    <table style={{ width: '100%', marginLeft: '20px', marginBottom: '15px' }}>
                        <tbody>
                            <tr><td style={{ width: '150px' }}>Nama</td><td style={{ width: '10px' }}>:</td><td>{data.nama_orangtua || ''}</td></tr>
                            <tr><td>Pekerjaan</td><td>:</td><td>{data.pekerjaan_orangtua || ''}</td></tr>
                            <tr><td>Alamat</td><td>:</td><td>{data.alamat_orangtua || ''}</td></tr>
                        </tbody>
                    </table>

                    <p style={{ marginBottom: '10px' }}>Orang tua/ Wali dari siswa :</p>
                    <table style={{ width: '100%', marginLeft: '20px', marginBottom: '15px' }}>
                        <tbody>
                            <tr><td style={{ width: '150px' }}>Nama</td><td style={{ width: '10px' }}>:</td><td><strong>{data.nama_siswa || ''}</strong></td></tr>
                            <tr><td>Nomor Induk / NISN</td><td>:</td><td>{data.nis || ''} / {data.nisn || ''}</td></tr>
                            <tr><td>Jenis Kelamin</td><td>:</td><td>{data.jenis_kelamin === 'L' ? 'Laki-laki' : data.jenis_kelamin === 'P' ? 'Perempuan' : ''}</td></tr>
                            <tr><td>Siswa Kelas</td><td>:</td><td>{data.kelas || ''}</td></tr>
                        </tbody>
                    </table>

                    <p style={{ textIndent: '40px' }}>
                        Mengajukan permohonan pindah belajar untuk siswa tersebut di atas ke <strong>{data.sekolah_tujuan || ''}</strong> dengan alasan {data.alasan_pindah || ''}.
                    </p>
                    <p style={{ textIndent: '40px', marginBottom: '50px' }}>
                        Atas perhatian dan kerja sama saudara, kami ucapkan terima kasih.
                    </p>
                </div>

                {/* Tanda Tangan Lembar 1 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'center', width: '250px' }}>
                        <div>{data.tempat_surat || 'Tasikmalaya'}, {formatDate(data.tanggal_surat)}</div>
                        <div>Pemohon</div>
                        <div>Orang tua/Wali Murid</div>
                        <div style={{ marginTop: '80px', fontWeight: 'bold', textDecoration: 'underline' }}>{data.nama_orangtua || ''}</div>
                    </div>
                </div>
            </div>

            {/* ==================== LEMBAR 2: FORMULIR PENGAJUAN PINDAH ==================== */}
            <div className="page-container page-break">
                <KopSurat />

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline' }}>FORMULIR PENGAJUAN PINDAH BELAJAR SISWA</div>
                </div>

                <div style={{ fontWeight: 'bold', marginBottom: '10px', textDecoration: 'underline' }}>DATA YANG MENGAJUKAN</div>
                <table style={{ width: '100%', marginBottom: '20px' }}>
                    <tbody>
                        <tr><td style={{ width: '200px' }}>Nama</td><td style={{ width: '10px' }}>:</td><td>{data.nama_orangtua || ''}</td></tr>
                        <tr><td>Status</td><td>:</td><td>Orang tua/Wali Murid</td></tr>
                    </tbody>
                </table>

                <div style={{ fontWeight: 'bold', marginBottom: '10px', textDecoration: 'underline' }}>DATA MUTASI</div>
                <table style={{ width: '100%', marginBottom: '40px' }}>
                    <tbody>
                        <tr><td style={{ width: '200px', paddingBottom: '8px' }}>NIS / NISN</td><td style={{ width: '10px' }}>:</td><td>{data.nis || ''} / {data.nisn || ''}</td></tr>
                        <tr><td style={{ paddingBottom: '8px' }}>Nama</td><td>:</td><td style={{ fontWeight: 'bold' }}>{data.nama_siswa || ''}</td></tr>
                        <tr><td style={{ paddingBottom: '8px' }}>Tempat, Tanggal Lahir</td><td>:</td><td>{data.tempat_lahir || ''}, {formatDate(data.tanggal_lahir)}</td></tr>
                        <tr><td style={{ paddingBottom: '8px' }}>Jenis Kelamin</td><td>:</td><td>{data.jenis_kelamin === 'L' ? 'Laki-laki' : data.jenis_kelamin === 'P' ? 'Perempuan' : ''}</td></tr>
                        <tr><td style={{ paddingBottom: '8px' }}>Tingkat Kelas</td><td>:</td><td>{data.kelas || ''}</td></tr>
                        <tr><td style={{ paddingBottom: '8px' }}>Nama Sekolah Asal</td><td>:</td><td>{namaTitleCase}</td></tr>
                        <tr><td style={{ paddingBottom: '8px' }}>Nama Sekolah Tujuan</td><td>:</td><td>{data.sekolah_tujuan || ''}</td></tr>
                        <tr><td style={{ paddingBottom: '8px' }}>No / Tgl. Surat Mutasi</td><td>:</td><td>{data.nomor_surat || ''}</td></tr>
                    </tbody>
                </table>

                {/* Tanda Tangan Lembar 2 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'center', width: '250px' }}>
                        <div>{data.tempat_surat || 'Tasikmalaya'}, {formatDate(data.tanggal_surat)}</div>
                        <div>Yang mengajukan</div>
                        <div>Orang tua/Wali Murid</div>
                        <div style={{ marginTop: '80px', fontWeight: 'bold', textDecoration: 'underline' }}>{data.nama_orangtua || ''}</div>
                    </div>
                </div>
            </div>

            {/* ==================== LEMBAR 3: SURAT KETERANGAN MUTASI ==================== */}
            <div className="page-container">
                <KopSurat />

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline' }}>SURAT KETERANGAN MUTASI</div>
                    <div>Nomor : {data.nomor_surat || ''}</div>
                </div>

                <p style={{ marginBottom: '15px' }}>Kepala {namaTitleCase} Kabupaten Tasikmalaya menerangkan :</p>

                <table style={{ width: '100%', marginBottom: '15px' }}>
                    <tbody>
                        <tr><td style={{ width: '250px', paddingBottom: '6px' }}>Nama</td><td style={{ width: '10px' }}>:</td><td style={{ fontWeight: 'bold' }}>{data.nama_siswa || ''}</td></tr>
                        <tr><td style={{ paddingBottom: '6px' }}>Jenis Kelamin</td><td>:</td><td>{data.jenis_kelamin === 'L' ? 'Laki-laki' : data.jenis_kelamin === 'P' ? 'Perempuan' : ''}</td></tr>
                        <tr><td style={{ paddingBottom: '6px' }}>Agama</td><td>:</td><td>{data.agama || ''}</td></tr>
                        <tr><td style={{ paddingBottom: '6px' }}>Tempat / Tanggal Lahir</td><td>:</td><td>{data.tempat_lahir || ''}, {formatDate(data.tanggal_lahir)}</td></tr>
                        <tr><td style={{ paddingBottom: '6px' }}>Diterima disekolah ini</td><td>:</td><td>{formatDate(data.tanggal_diterima)}</td></tr>
                        <tr><td style={{ paddingBottom: '6px' }}>Nama Orang tua/Wali</td><td>:</td><td>{data.nama_orangtua || ''}</td></tr>
                        <tr><td style={{ paddingBottom: '6px' }}>NISN</td><td>:</td><td>{data.nisn || ''}</td></tr>
                        <tr><td style={{ paddingBottom: '6px' }}>Tanggal Meninggalkan Sekolah ini</td><td>:</td><td>{formatDate(data.tanggal_keluar)}</td></tr>
                        <tr><td style={{ paddingBottom: '6px' }}>Waktu meninggalkan Sekolah ini Kelas</td><td>:</td><td>{data.kelas || ''}</td></tr>
                        <tr><td style={{ paddingBottom: '6px' }}>Alasan meninggalkan Sekolah ini</td><td>:</td><td>{data.alasan_pindah || ''}</td></tr>
                    </tbody>
                </table>

                <p style={{ textIndent: '40px', marginBottom: '10px', textAlign: 'justify' }}>
                    Dipindahkan belajarnya dari {namaTitleCase} ke <strong>{data.sekolah_tujuan || ''}</strong> atas {data.alasan_pindah || ''}.
                </p>
                <p style={{ textIndent: '40px', marginBottom: '40px' }}>
                    Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.
                </p>

                {/* Tanda Tangan Lembar 3 (Kepala Madrasah) */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ textAlign: 'left', width: '300px' }}>
                        <div>{data.tempat_surat || 'Tasikmalaya'}, {formatDate(data.tanggal_surat)}</div>
                        <div style={{ marginBottom: '80px' }}>Kepala,</div>
                        <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{schoolData?.nama_kepala_madrasah || ''}</div>
                        <div>NIP. {schoolData?.nip_kepala_madrasah || ''}</div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PrintMutasiKeluar;