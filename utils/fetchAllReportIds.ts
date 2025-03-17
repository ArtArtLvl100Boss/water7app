// utils/fetchAllReportIds.ts

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const fetchAllReportIds = async () => {
  const reportsCollection = collection(db, 'reports');
  const reportsSnapshot = await getDocs(reportsCollection);
  const reportIds = reportsSnapshot.docs.map(doc => doc.id);
  return reportIds;
};