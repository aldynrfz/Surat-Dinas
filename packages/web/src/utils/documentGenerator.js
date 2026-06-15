import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import PizZipUtils from 'pizzip/utils/index.js';
import { saveAs } from 'file-saver';

const loadFile = (url, callback) => {
    PizZipUtils.getBinaryContent(url, callback);
};

export const generateAssignmentLetter = (data, templatePath = "/templates/word/surat_tugas.docx") => {
    return new Promise((resolve, reject) => {
        loadFile(templatePath, function (error, content) {
            if (error) {
                // Fallback path trial
                loadFile("/packages/web/public/templates/word/surat_tugas.docx", function (err2, content2) {
                    if (err2) {
                        reject(new Error("Could not find template file. Please ensure 'surat_tugas.docx' exists in public/templates/word/"));
                        return;
                    }
                    processContent(content2, data, resolve, reject);
                });
                return;
            }
            processContent(content, data, resolve, reject);
        });
    });
};

const processContent = (content, data, resolve, reject) => {
    try {
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Format dates
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            return new Date(dateString).toLocaleDateString('id-ID', options);
        };

        const renderData = {
            ...data,
            tanggal_surat: formatDate(data.tanggal_surat),
            hari_tanggal: formatDate(data.hari_tanggal),
        };

        doc.render(renderData);

        const out = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        saveAs(out, `Surat_Tugas_${data.nama || 'Pegawai'}.docx`);
        resolve(true);
    } catch (error) {
        console.error("Generator Error:", error);
        reject(error);
    }
};

export const generateActiveStudentLetter = (data, templatePath = "/templates/word/SURAT_KETERANGAN_SISWA_AKTIF.docx") => {
    return new Promise((resolve, reject) => {
        loadFile(templatePath, function (error, content) {
            if (error) {
                // Fallback path trial
                loadFile("/packages/web/public/templates/word/SURAT_KETERANGAN_SISWA_AKTIF.docx", function (err2, content2) {
                    if (err2) {
                        reject(new Error("Could not find template file. Please ensure 'SURAT_KETERANGAN_SISWA_AKTIF.docx' exists in public/templates/word/"));
                        return;
                    }
                    processActiveStudentContent(content2, data, resolve, reject);
                });
                return;
            }
            processActiveStudentContent(content, data, resolve, reject);
        });
    });
};

const processActiveStudentContent = (content, data, resolve, reject) => {
    try {
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Format dates
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            return new Date(dateString).toLocaleDateString('id-ID', options);
        };

        const renderData = {
            nomor_surat: data.nomor_surat || data.letterNumber || '',
            nama: data.nama || '',
            tempat_lahir: data.tempat_lahir || '',
            tgl_lahir: formatDate(data.tgl_lahir),
            nisn: data.nisn || '',
            kelas: data.kelas || '',
            tahun_pelajaran: data.tahun_pelajaran || '',
            nama_orangtua: data.nama_orangtua || '',
            alamat: data.alamat || '',
            tempat_surat: data.kota_surat || data.tempat_surat || '',
            tanggal_surat: formatDate(data.tanggal_surat || data.date),
            nama_kepala: data.nama_kepala || '',
            nip_kepala: data.nip_kepala || ''
        };

        doc.render(renderData);

        const out = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        saveAs(out, `Surat_Siswa_Aktif_${data.nama || 'Siswa'}.docx`);
        resolve(true);
    } catch (error) {
        console.error("Generator Error:", error);
        reject(error);
    }
};
