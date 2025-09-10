"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function TestFirebase() {
    const [status, setStatus] = useState("Testing...");
    const [data, setData] = useState([]);

    useEffect(() => {
        const testConnection = async () => {
            try {
                console.log("🧪 Testing Firebase connection...");

                // Test basic connection
                const mangaRef = collection(db, "manga");
                const snapshot = await getDocs(mangaRef);

                console.log("📊 Total documents:", snapshot.size);

                if (snapshot.empty) {
                    setStatus("❌ Connected but no data found");
                } else {
                    setStatus(`✅ Connected! Found ${snapshot.size} documents`);

                    const docs = [];
                    snapshot.forEach((doc) => {
                        docs.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });

                    setData(docs.slice(0, 5)); // Show first 5
                }

            } catch (error) {
                console.error("❌ Firebase test failed:", error);
                setStatus(`❌ Connection failed: ${error.message}`);
            }
        };

        testConnection();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">Firebase Connection Test</h1>

                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Status:</h2>
                    <p className="text-lg text-gray-300">{status}</p>
                </div>

                {data.length > 0 && (
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold text-white mb-4">Sample Data:</h2>
                        <div className="space-y-4">
                            {data.map((item) => (
                                <div key={item.id} className="bg-gray-700 p-4 rounded">
                                    <p className="text-white font-bold">{item.title || "No title"}</p>
                                    <p className="text-gray-400 text-sm">ID: {item.id}</p>
                                    <p className="text-gray-400 text-sm">Chapters: {item.chapters || 0}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}