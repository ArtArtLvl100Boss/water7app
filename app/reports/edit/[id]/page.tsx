// Make this a Server Component
import { fetchAllReportIds } from '@/utils/fetchAllReportIds';
import EditReportClient from './edit-client'; // We'll create this file next

// Generate static params at build time
export async function generateStaticParams() {
    try {
        const ids = await fetchAllReportIds();
        return ids.map((id) => ({
            id: id.toString(),
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return []; // Return empty array as fallback
    }
}

// The main page component is now a server component
export default function EditReportPage({ params }: { params: { id: string } }) {
    return <EditReportClient id={params.id} />;
}
