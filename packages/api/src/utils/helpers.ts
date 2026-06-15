/**
 * Generate letter number based on schema
 * Format: [number]/[ref]/[school]/[year]
 * Example: 421/105/SMP/2024
 */
export const generateLetterNumber = (params: {
    sequence: number;
    referenceCode: string;
    schoolCode: string;
    year?: number;
}): string => {
    const { sequence, referenceCode, schoolCode, year } = params;
    const currentYear = year || new Date().getFullYear();

    return `${sequence}/${referenceCode}/${schoolCode}/${currentYear}`;
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: string | Date): number => {
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
};

/**
 * Calculate service period (years and months)
 */
export const calculateServicePeriod = (
    joinDate: string | Date
): { years: number; months: number } => {
    const start = typeof joinDate === 'string' ? new Date(joinDate) : joinDate;
    const today = new Date();

    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months };
};

/**
 * Format Indonesian date
 * Example: "12 Oktober 2024"
 */
export const formatIndonesianDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
};

/**
 * Sanitize filename for safe file storage
 */
export const sanitizeFilename = (filename: string): string => {
    return filename
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '_')
        .replace(/_+/g, '_');
};

/**
 * Calculate duration in days between two dates
 */
export const calculateDaysDuration = (
    startDate: string | Date,
    endDate: string | Date
): number => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1; // Include both start and end date
};

/**
 * Validate Indonesian NIP (Nomor Induk Pegawai)
 * Format: 18 digits
 */
export const validateNIP = (nip: string): boolean => {
    return /^\d{18}$/.test(nip);
};

/**
 * Validate Indonesian NISN (Nomor Induk Siswa Nasional)
 * Format: 10 digits
 */
export const validateNISN = (nisn: string): boolean => {
    return /^\d{10}$/.test(nisn);
};
