"use client";

import React, { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_BROWSER_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [meetingStats, setMeetingStats] = useState({ total: 0, week: 0, month: 0, byType: {} as Record<string, number> });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch user profile
        const profileRes = await fetch("/api/session", { credentials: "include" });
        const profileData = await profileRes.json();
        setUserName(profileData.user?.name || profileData.user?.first_name || "User");

        // Fetch meetings
        const meetingsRes = await fetch("/api/meetings", { credentials: "include" });
        const meetingsData = await meetingsRes.json();
        const meetings = meetingsData.meetings || [];

        // Upcoming meetings: next 5 by date
        const now = new Date();
        const upcoming = meetings
          .filter((m: any) => new Date(m.date) > now)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        setUpcomingMeetings(upcoming);

        // Recent activity: last 5 meetings (by date desc)
        const recent = meetings
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map((m: any) => ({
            id: m.id,
            type: "Meeting",
            title: m.title,
            date: m.date,
            status: "Completed"
          }));
        setRecentActivity(recent);

        // Meeting stats
        const total = meetings.length;
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const week = meetings.filter((m: any) => new Date(m.date) >= weekStart).length;
        const month = meetings.filter((m: any) => new Date(m.date) >= monthStart).length;
        const byType: Record<string, number> = {};
        meetings.forEach((m: any) => {
          byType[m.source] = (byType[m.source] || 0) + 1;
        });
        setMeetingStats({ total, week, month, byType });
      } catch (err) {
        // fallback to empty
        setUserName('User');
        setUpcomingMeetings([]);
        setRecentActivity([]);
        setMeetingStats({ total: 0, week: 0, month: 0, byType: {} });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Dashboard</h2>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl flex flex-col gap-8 border border-gray-100">
        {/* 1. Welcome Header */}
        <div className="flex flex-col items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Welcome, {userName}!</h3>
          <p className="text-gray-600 mt-1">Here's a quick summary of your activity.</p>
        </div>
        {/* 2. Upcoming Meetings */}
        <div>
          <h4 className="text-lg font-semibold mb-2 text-blue-700">Upcoming Meetings</h4>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : upcomingMeetings.length > 0 ? (
            <ul className="divide-y">
              {upcomingMeetings.map(m => (
                <li key={m.id} className="py-2 flex justify-between items-center">
                  <span className="font-medium text-gray-800">{m.title}</span>
                  <span className="text-gray-500 text-sm">{m.date}</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs ml-2">{m.source}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No upcoming meetings.</div>
          )}
        </div>
        {/* 3. Recent Activity */}
        <div>
          <h4 className="text-lg font-semibold mb-2 text-blue-700">Recent Activity</h4>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : recentActivity.length > 0 ? (
            <ul className="divide-y">
              {recentActivity.map(a => (
                <li key={a.id} className="py-2 flex items-center justify-between">
                  <span className="font-medium text-gray-800 flex-1">{a.title}</span>
                  <span className="text-gray-500 text-sm flex-1 text-center">{a.date}</span>
                  <span className={`px-2 py-1 rounded text-xs ml-2 text-center ${a.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`} style={{ display: 'inline-block', minWidth: '80px' }}>{a.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No recent activity.</div>
          )}
        </div>
        {/* 4. Meeting Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-700">{meetingStats.total}</span>
            <span className="text-gray-700">Total Meetings</span>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-xl font-bold text-green-700">{meetingStats.week}</span>
            <span className="text-gray-700">This Week</span>
            <span className="text-xl font-bold text-green-700 mt-2">{meetingStats.month}</span>
            <span className="text-gray-700">This Month</span>
          </div>
          <div className="col-span-2 bg-gray-50 rounded-lg p-4 mt-2">
            <span className="font-semibold text-gray-700">By Type:</span>
            <div className="flex gap-4 mt-2">
              {Object.entries(meetingStats.byType).map(([type, count]) => (
                <div key={type} className="bg-white border rounded px-3 py-1 text-sm text-gray-700">
                  {type}: <span className="font-bold text-blue-700">{String(count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}