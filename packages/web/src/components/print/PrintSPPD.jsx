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

  @page { 
    size: A4; 
    margin: 1.5cm 2cm; 
  }
  
  body {
    background: white;
    font-family: Arial, sans-serif !important;
    color: black;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
  }

  .page-break {
    page-break-after: always;
  }

  #print-section {
    display: block !important;
  }

  .table-sppd {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
    margin-bottom: 15px;
  }
  .table-sppd th, .table-sppd td {
    border: 1px solid black;
    padding: 6px 8px;
    vertical-align: top;
  }

  .table-visum {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
  }
  .table-visum td.cell-visum {
    border: 1px solid black;
    padding: 8px 12px;
    vertical-align: top;
  }

  .no-border, .no-border tr, .no-border td {
    border: none !important;
    padding: 2px !important;
  }
  .text-center { text-align: center; }
  .font-bold { font-weight: bold; }
}
`;

const PrintSPPD = ({ data }) => {
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

    return (
        <div id="print-section" className="print-only" style={{ fontFamily: 'Arial, sans-serif' }}>
            <style>{stylePrint}</style>

            {/* HALAMAN 1: DEPAN */}
            <div className="page-break">

                <div className="text-center" style={{ marginBottom: '10px' }}>
                    <img src="/images/logo_garuda.png" alt="Garuda" style={{ width: '65px' }} />
                </div>

                <table className="no-border" style={{ width: '100%', marginBottom: '20px', fontSize: '10pt' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '60%', verticalAlign: 'top' }}>
                                <div className="font-bold">KEMENTERIAN AGAMA</div>
                                <div className="font-bold">{schoolData?.nama_madrasah_lengkap || 'MADRASAH TSANAWIYAH NEGERI 11 TASIKMALAYA'}</div>
                            </td>
                            <td style={{ width: '40%', verticalAlign: 'top' }}>
                                <table className="no-border" style={{ width: '100%' }}>
                                    <tbody>
                                        <tr><td style={{ width: '35%' }}>Lampiran ke</td><td style={{ width: '5%' }}>:</td><td>{data.lampiran || '1(Satu)'}</td></tr>
                                        <tr><td>Lembar</td><td>:</td><td>{data.lembar || '-'}</td></tr>
                                        <tr><td>Kode Nomor</td><td>:</td><td>{data.nomor_surat || ''}</td></tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="text-center" style={{ marginBottom: '15px' }}>
                    <div className="font-bold" style={{ fontSize: '12pt', textDecoration: 'underline' }}>SURAT PERJALANAN DINAS (SPD)</div>
                </div>

                <table className="table-sppd">
                    <tbody>
                        <tr>
                            <td className="text-center" style={{ width: '4%' }}>1.</td>
                            <td style={{ width: '38%' }}>Pejabat Pembuat Komitmen</td>
                            <td colSpan="3">MTs Negeri 11 Tasikmalaya</td>
                        </tr>
                        <tr>
                            <td className="text-center">2.</td>
                            <td>Nama / NIP pegawai yang melaksanakan perjalanan Dinas</td>
                            <td colSpan="3">
                                {data.nama_pegawai || ''} <br />
                                NIP. {data.nip_pegawai || ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-center">3.</td>
                            <td>
                                a. Pangkat dan golongan <br />
                                b. Jabatan / Instansi <br />
                                c. Tingkat Biaya Perjalanan Dinas
                            </td>
                            <td colSpan="3">
                                a. {data.pangkat_golongan || ''} <br />
                                b. {data.jabatan || ''} <br />
                                c. {data.tingkat_biaya_perjalanan_dinas || ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-center">4.</td>
                            <td>Maksud perjalanan dinas</td>
                            <td colSpan="3">{data.maksud_perjalanan_dinas || ''}</td>
                        </tr>
                        <tr>
                            <td className="text-center">5.</td>
                            <td>Alat angkutan yang dipergunakan</td>
                            <td colSpan="3">{data.alat_angkutan || ''}</td>
                        </tr>
                        <tr>
                            <td className="text-center">6.</td>
                            <td>
                                a. Tempat Berangkat <br />
                                b. Tempat Tujuan
                            </td>
                            <td colSpan="3">
                                a. {data.tempat_berangkat || 'MTsN 11 Tasikmalaya'} <br />
                                b. {data.tempat_tujuan || ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-center">7.</td>
                            <td>
                                a. Lamanya perjalanan Dinas <br />
                                b. Tanggal berangkat <br />
                                c. Tanggal harus kembali
                            </td>
                            <td colSpan="3">
                                a. {data.lamanya_perjalanan || ''} <br />
                                b. {formatDate(data.tanggal_berangkat)} <br />
                                c. {formatDate(data.tanggal_kembali)}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-center" rowSpan="2">8.</td>
                            <td>Pengikut: Nama</td>
                            <td style={{ width: '25%' }}>Tanggal Lahir</td>
                            <td colSpan="2">Keterangan</td>
                        </tr>
                        <tr>
                            <td>1. {data.pengikut_1 || '...................................................'}</td>
                            <td>{data.pengikut_1_tgl || '.............................'}</td>
                            <td colSpan="2">{data.pengikut_1_ket || '.............................'}</td>
                        </tr>
                        <tr>
                            <td className="text-center">9.</td>
                            <td>
                                Pembebanan Anggaran <br />
                                a. Instansi <br />
                                b. Mata Anggaran
                            </td>
                            <td colSpan="3">
                                <br />
                                a. {data.instansi || 'MTsN 11 Tasikmalaya'} <br />
                                b. {data.mata_anggaran || ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-center">10.</td>
                            <td>Keterangan lain-lain</td>
                            <td colSpan="3">{data.keterangan_lain || '-'}</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', fontSize: '10pt' }}>
                    <div style={{ width: '320px' }}>
                        <table className="no-border" style={{ width: '100%' }}>
                            <tbody>
                                <tr><td style={{ width: '35%' }}>Dikeluarkan di</td><td style={{ width: '5%' }}>:</td><td>{data.tempat_surat || 'Tanjungjaya'}</td></tr>
                                <tr><td>Tanggal</td><td>:</td><td>{formatDate(data.tanggal_surat)}</td></tr>
                            </tbody>
                        </table>
                        <div className="font-bold" style={{ marginTop: '5px' }}>Pejabat Pembuat Komitmen,</div>
                        <div style={{ height: '60px' }}></div>
                        <div className="font-bold" style={{ textDecoration: 'underline' }}>{data.nama_ppk || 'AI NIZAR, S.Pd.I'}</div>
                        <div>NIP. {data.nip_ppk || '197911162009101001'}</div>
                    </div>
                </div>
            </div>

            {/* HALAMAN 2: BELAKANG */}
            <div style={{ fontSize: '10pt' }}>
                <table className="table-visum">
                    <tbody>
                        {/* ROW I: KHUSUS (KEPALA MADRASAH DI SEBELAH KANAN) */}
                        <tr>
                            <td className="cell-visum" style={{ width: '50%' }}>
                                <table className="no-border" style={{ width: '100%' }}>
                                    <tbody>
                                        <tr><td style={{ width: '15%' }}>I.</td><td style={{ width: '25%' }}>Tiba di</td><td>: .......................................</td></tr>
                                        <tr><td></td><td>Pada Tgl.</td><td>: .......................................</td></tr>
                                        <tr><td></td><td>Kepala</td><td>: .......................................</td></tr>
                                        <tr><td colSpan="3" className="text-center"><br /><br /><br />( ..................................................... )</td></tr>
                                    </tbody>
                                </table>
                            </td>
                            <td className="cell-visum" style={{ width: '50%' }}>
                                <table className="no-border" style={{ width: '100%' }}>
                                    <tbody>
                                        <tr><td style={{ width: '35%' }}>Berangkat dari</td><td>: {data.tempat_berangkat || 'MTsN 11 Tasikmalaya'}</td></tr>
                                        <tr><td>Ke</td><td>: {data.tempat_tujuan || '................................'}</td></tr>
                                        <tr><td>Pada Tanggal</td><td>: {formatDate(data.tanggal_berangkat)}</td></tr>
                                        <tr><td>Kepala</td><td>: MTsN 11 Tasikmalaya</td></tr>
                                        <tr>
                                            <td colSpan="2" className="text-center">
                                                <br />
                                                <div className="font-bold" style={{ textDecoration: 'underline', marginTop: '45px' }}>
                                                    {data.nama_kepala || schoolData?.nama_kepala_madrasah}
                                                </div>
                                                <div>NIP. {data.nip_kepala || schoolData?.nip_kepala_madrasah}</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>

                        {/* ROW II SAMPAI V: KOSONG (UNTUK PEJABAT LUAR) */}
                        {['II', 'III', 'IV', 'V'].map((num, idx) => (
                            <tr key={idx}>
                                <td className="cell-visum"><div style={{ height: '120px' }}> {num}. Tiba di : ... </div></td>
                                <td className="cell-visum"><div> Berangkat dari : ... </div></td>
                            </tr>
                        ))}

                        {/* ROW VI: TANDA TANGAN PPK DOUBLE (KIRI & KANAN) */}
                        <tr>
                            <td colSpan="2" className="cell-visum" style={{ padding: '15px' }}>
                                <table className="no-border" style={{ width: '100%', marginBottom: '15px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '5%' }}>VI.</td>
                                            <td style={{ width: '20%' }}>Tiba di <br />(Tempat Kedudukan)</td>
                                            <td>: {data.tempat_berangkat || 'MTsN 11 Tasikmalaya'}</td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td>Pada Tanggal</td>
                                            <td>: {formatDate(data.tanggal_kembali)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ textAlign: 'justify', marginBottom: '20px', paddingLeft: '5%' }}>
                                    Telah diperiksa dengan keterangan bahwa perjalanan tersebut di atas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.
                                </div>

                                <table className="no-border" style={{ width: '100%', textAlign: 'center' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '50%' }}>
                                                <div className="font-bold">Pejabat Pembuat Komitmen,</div>
                                                <div style={{ height: '65px' }}></div>
                                                <div className="font-bold" style={{ textDecoration: 'underline' }}>{data.nama_ppk || 'AI NIZAR, S.Pd.I'}</div>
                                                <div>NIP. {data.nip_ppk || '197911162009101001'}</div>
                                            </td>
                                            <td style={{ width: '50%' }}>
                                                <div className="font-bold">Pejabat Pembuat Komitmen,</div>
                                                <div style={{ height: '65px' }}></div>
                                                <div className="font-bold" style={{ textDecoration: 'underline' }}>{data.nama_ppk || 'AI NIZAR, S.Pd.I'}</div>
                                                <div>NIP. {data.nip_ppk || '197911162009101001'}</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ marginTop: '15px' }}>
                    <div className="font-bold">VII. Catatan lain-lain</div>
                    <div className="font-bold" style={{ marginTop: '5px' }}>VIII. Perhatian</div>
                    <div style={{ textAlign: 'justify', marginTop: '2px' }}>
                        PPK yang menerbitkan SPD, Pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan-peraturan Keuangan Negara apabila Negara menderita rugi akibat kesalahan, kelalaian dan kealpaannya.
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PrintSPPD;