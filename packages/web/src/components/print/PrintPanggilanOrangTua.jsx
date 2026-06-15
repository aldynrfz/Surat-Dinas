import React from 'react';
import { useSchool } from '../../contexts/SchoolContext';

const stylePrint = `
@media print {
  /* RESET BATASAN LAYAR APLIKASI */
  html, body, #root, div[class*="overflow-"], div[class*="flex-1"], div[class*="h-screen"] {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    position: static !important;
  }

  #print-section {
    display: block !important;
  }

  body {
    background: white;
    font-family: "Times New Roman", Times, serif !important;
    color: black;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
  }

  @page { 
    size: A4; 
    margin: 1cm 2cm; 
  }

  .signature-container {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    -webkit-column-break-inside: avoid !important;
    display: inline-block !important; 
    width: 100%;
  }

  .content-wrapper {
    font-size: 12pt;
    color: black;
    line-height: 1.15;
  }

  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .font-bold { font-weight: bold; }
  .underline { text-decoration: underline; }
  .uppercase { text-transform: uppercase; }

  /* KOP SURAT STYLING (Di-override via inline style seperti surat lain) */
}

/* LAYOUT FOR SCREEN PREVIEW */
.content-wrapper {
  background: white;
  color: black;
  padding: 40px;
  max-width: 800px;
  margin: auto;
  font-family: "Times New Roman", Times, serif;
  display: block;
  line-height: 1.15;
}
`;

const PrintParentCallLetter = ({ data }) => {
    const { schoolData } = useSchool();

    if (!data) return null;

    // Helper untuk format tanggal Indonesia (11 Mei 2026)
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', options);
        } catch {
            return dateStr;
        }
    };

    // Helper untuk format Hari, Tanggal (Senin, 11 Mei 2026)
    const formatDayDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', options);
        } catch {
            return dateStr;
        }
    };

    // Ambil data dari field baru atau fallback ke data lama jika belum diisi
    const namaLengkap = schoolData?.nama_madrasah_lengkap || schoolData?.nama_madrasah || 'MADRASAH TSANAWIYAH NEGERI 11 TASIKMALAYA';

    return (
        <div id="print-section" className="content-wrapper">
            <style>{stylePrint}</style>

            {/* KOP SURAT (Disamakan dengan Surat Siswa Aktif) */}
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
                    <div style={{ fontSize: '14pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {namaLengkap.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '9pt', marginTop: '4px' }}>
                        Alamat : {schoolData?.alamat_madrasah || 'Jalan Pasirjaya - Tanjungjaya Telp. (0265) 548519 Tasikmalaya 46185'}
                    </div>
                </div>

                <div style={{ width: '100px', flexShrink: 0 }}></div>
            </div>

            {/* NOMOR & TANGGAL SURAT */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <table style={{ width: '60%' }}>
                    <tbody>
                        <tr><td style={{ width: '80px', padding: '2px 0' }}>Nomor</td><td style={{ padding: '2px 0' }}>: {data.nomor_surat}</td></tr>
                        <tr><td style={{ padding: '2px 0' }}>Lampiran</td><td style={{ padding: '2px 0' }}>: {data.lampiran}</td></tr>
                        <tr><td style={{ padding: '2px 0' }}>Perihal</td><td style={{ padding: '2px 0' }}>: <span className="font-bold underline">Panggilan Orang Tua/Wali</span></td></tr>
                    </tbody>
                </table>
                <div style={{ textAlign: 'right' }}>
                    {data.tempat_surat}, {formatDate(data.tgl_surat)}
                </div>
            </div>

            {/* TUJUAN SURAT */}
            <div style={{ marginBottom: '20px' }}>
                Kepada Yth.<br />
                <span className="font-normal">Bapak/Ibu Orang Tua / Wali Murid</span><br />
                {schoolData?.nama_madrasah || 'MTs. Negeri 11 Tasikmalaya'}<br />
                di<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tempat
            </div>

            {/* ISI SURAT */}
            <div style={{ textAlign: 'justify', marginBottom: '15px' }}>
                Assalaamu’alaikum wr.wb.<br /><br />
                <p style={{ textIndent: '40px', margin: 0 }}>
                    Do’a dan harapan semoga Allah SWT senantiasa memberikan rahmat, taufik serta hidayah-Nya kepada kita semua dalam melaksanakan tugas dan segala aktifitas. Amiin.
                </p>
                <p style={{ textIndent: '40px', margin: '10px 0 0 0' }}>
                    Sehubungan dengan adanya beberapa hal yang perlu didiskusikan antara sekolah dengan pihak orang tua siswa yang berkaitan dengan perkembangan proses belajar siswa yang bernama:
                </p>
            </div>

            {/* DATA SISWA */}
            <table style={{ margin: '0 0 15px 40px' }}>
                <tbody>
                    <tr><td style={{ width: '120px', padding: '2px 0' }}>Nama</td><td style={{ padding: '2px 0' }}>: <span className="font-normal">{data.nama}</span></td></tr>
                    <tr><td style={{ padding: '2px 0' }}>Kelas</td><td style={{ padding: '2px 0' }}>: <span className="font-normal">{data.kelas}</span></td></tr>
                </tbody>
            </table>

            <div style={{ marginBottom: '15px' }}>
                <p style={{ textIndent: '40px', margin: 0 }}>Maka Kami mengundang kepada Bapak/Ibu untuk hadir pada :</p>
            </div>

            {/* JADWAL PANGGILAN */}
            <table style={{ margin: '0 0 15px 40px' }}>
                <tbody>
                    <tr><td style={{ width: '120px', padding: '2px 0' }}>Hari / Tanggal</td><td style={{ padding: '2px 0' }}>: <span className="font-normal">{formatDayDate(data.hari_tanggal)}</span></td></tr>
                    <tr><td style={{ padding: '2px 0' }}>Waktu</td><td style={{ padding: '2px 0' }}>: <span className="font-normal">{data.waktu}</span></td></tr>
                    <tr><td style={{ padding: '2px 0' }}>Tempat</td><td style={{ padding: '2px 0' }}>: <span className="font-normal">{data.tempat}</span></td></tr>
                </tbody>
            </table>

            <div style={{ textAlign: 'justify', marginBottom: '25px' }}>
                <p style={{ textIndent: '40px', margin: 0 }}>
                    Mengingat sangat pentingnya pemberitahuan ini, maka kami sangat mengharapkan kehadiran tepat pada waktunya, dan ini merupakan panggilan resmi dari sekolah.
                </p>
                <p style={{ textIndent: '40px', margin: '10px 0 0 0' }}>
                    Demikian surat ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan terima kasih.
                </p>
                <br />
                Wassalaamu’alaikum wr.wb.
            </div>

            {/* TANDA TANGAN (3 PIHAK) - DIBUNGKUS DALAM CONTAINER ANTI-POTONG */}
            <div className="signature-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ width: '45%', textAlign: 'center' }}>
                        Wali Kelas,
                        <div style={{ height: '60px' }}></div>
                        <div className="font-bold underline">{data.wali_kelas || '................................'}</div>
                        <div>NIP. {data.nip_wali_kelas || '................................'}</div>
                    </div>
                    <div style={{ width: '45%', textAlign: 'center' }}>
                        Koordinator BP/BK,
                        <div style={{ height: '60px' }}></div>
                        <div className="font-bold underline">{data.kordinator_bp || '................................'}</div>
                        <div>NIP. {data.nip_kordinator_bp || '................................'}</div>
                    </div>
                </div>

                <div style={{ width: '100%', textAlign: 'center' }}>
                    Mengetahui,<br />
                    Waka Kesiswaan,
                    <div style={{ height: '60px' }}></div>
                    <div className="font-bold underline">{data.waka_kesiswaan || '................................'}</div>
                    <div>NIP. {data.nip_waka_kesiswaan || '................................'}</div>
                </div>
            </div>

        </div>
    );
};

export default PrintParentCallLetter;