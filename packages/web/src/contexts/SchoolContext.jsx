import { createContext, useContext, useState, useEffect } from 'react';
import { getSchoolProfile, updateSchoolProfile } from '../services/dataService';

const SchoolContext = createContext({});

export const useSchool = () => {
    const context = useContext(SchoolContext);
    if (!context) {
        throw new Error('useSchool must be used within SchoolProvider');
    }
    return context;
};

export const SchoolProvider = ({ children }) => {
    const [schoolData, setSchoolData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSchoolData = async () => {
        setLoading(true);
        try {
            const data = await getSchoolProfile();
            setSchoolData(data || {}); // Default to empty object if null
        } catch (err) {
            console.error("Failed to fetch school data:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolData();
    }, []);

    const updateSchool = async (newData) => {
        try {
            const id = schoolData?.id;
            await updateSchoolProfile(id, newData);
            // Refresh data after update or optimally just update local state
            setSchoolData(prev => ({ ...prev, ...newData }));
            return true;
        } catch (err) {
            console.error("Failed to update school data:", err);
            throw err;
        }
    };

    const value = {
        schoolData,
        loading,
        error,
        updateSchool,
        refreshSchoolData: fetchSchoolData
    };

    return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};

export default SchoolContext;
