'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, ExternalLink, MessageSquare, User, Flag } from 'lucide-react';
import Image from 'next/image';

interface Report {
  _id: string;
  reason: string;
  status: string;
  reporterId: {
    name: string;
    username: string;
  };
  postId: {
    _id: string;
    content: string;
    status: string;
    userId: {
      name: string;
      username: string;
    }
  };
  createdAt: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/admin/reports');
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      await axios.patch(`http://localhost:3001/admin/report/${reportId}/resolve`);
      setReports(reports.map(r => r._id === reportId ? { ...r, status: 'resolved' } : r));
    } catch (err) {
      console.error('Failed to resolve report', err);
    }
  };

  const blockPost = async (postId: string) => {
    if (!confirm('Are you sure you want to block this post?')) return;
    try {
      await axios.patch(`http://localhost:3001/admin/post/${postId}/block`);
      fetchReports(); // Refresh all to show blocked status
    } catch (err) {
      console.error('Failed to block post', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2 text-red-500">Security Reports</h1>
        <p className="text-muted-foreground font-medium">Handle user complaints and reported content.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="h-48 glass rounded-[40px] animate-pulse" />
          ))
        ) : reports.length === 0 ? (
          <div className="glass p-20 rounded-[40px] border border-white/5 text-center space-y-4">
             <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle size={32} />
             </div>
             <h3 className="text-2xl font-black italic tracking-tight">System Clean!</h3>
             <p className="text-muted-foreground font-medium max-w-sm mx-auto">There are no pending reports to review. Great job moderating the community!</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className={`glass rounded-[40px] border p-8 transition-all duration-500 ${
              report.status === 'pending' ? 'border-red-500/30' : 'border-white/5 opacity-60'
            }`}>
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-red-500">
                      <AlertTriangle size={20} />
                      <span className="text-xs font-black uppercase tracking-widest italic">Report Reason</span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      report.status === 'pending' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                     <p className="font-bold text-white leading-relaxed italic">"{report.reason}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/5 rounded-xl text-muted-foreground">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reporter</p>
                          <p className="text-sm font-bold">@{report.reporterId?.username}</p>
                        </div>
                     </div>
                     <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/5 rounded-xl text-muted-foreground">
                          <Flag size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
                          <p className="text-sm font-bold">{new Date(report.createdAt).toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex-1 bg-white/5 rounded-[32px] p-6 border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary italic flex items-center">
                         <MessageSquare size={12} className="mr-1" />
                         Reported Post
                       </span>
                       <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                         report.postId?.status === 'blocked' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                       }`}>
                         {report.postId?.status}
                       </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                       {report.postId?.content}
                    </p>
                    <p className="text-[10px] font-bold text-white/40">By @{report.postId?.userId.username}</p>
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <button
                      onClick={() => window.open(`/post/${report.postId?._id}`, '_blank')}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center"
                    >
                      <ExternalLink size={14} className="mr-2" /> View
                    </button>
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => resolveReport(report._id)}
                          className="flex-1 px-4 py-3 bg-green-500 text-white hover:bg-green-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20"
                        >
                          Resolve
                        </button>
                        {report.postId?.status !== 'blocked' && (
                          <button
                            onClick={() => blockPost(report.postId?._id)}
                            className="flex-1 px-4 py-3 bg-red-500 text-white hover:bg-red-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                          >
                            Block
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
