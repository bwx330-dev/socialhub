'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  PlusCircle,
} from 'lucide-react';
import { Instagram, TikTok } from '@/components/ui/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { scheduledPosts } from '@/lib/mock-data';
import Link from 'next/link';

const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function SchedulerPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  }, []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start of month with previous month's days
    const startDay = getDay(monthStart); // 0 = Sunday
    const paddedDays: (Date | null)[] = Array(startDay).fill(null);
    paddedDays.push(...days);

    // Pad end to fill last row
    while (paddedDays.length % 7 !== 0) {
      paddedDays.push(null);
    }

    return paddedDays;
  }, [currentMonth]);

  const getPostsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return scheduledPosts.filter((p) => p.scheduledDate === dateStr);
  };

  const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          {/* Month navigation */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#e6edf3]">
              <Calendar className="mr-2 inline-block h-5 w-5 text-[#58a6ff]" />
              {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="rounded-lg p-2 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="rounded-lg p-2 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-[#8b949e]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-square rounded-lg bg-[#0d1117]/30"
                  />
                );
              }

              const posts = getPostsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`relative aspect-square rounded-lg p-1 text-sm transition-all hover:bg-[#21262d]
                    ${isSelected ? 'bg-[#58a6ff]/15 ring-1 ring-[#58a6ff]/50' : ''}
                    ${today && !isSelected ? 'bg-[#21262d]' : ''}
                    ${!isSameMonth(day, currentMonth) ? 'text-[#8b949e]/40' : 'text-[#e6edf3]'}
                  `}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs
                      ${today ? 'bg-[#58a6ff] text-white font-bold' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Post indicators */}
                  {posts.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {posts.slice(0, 3).map((post, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            post.platform === 'instagram'
                              ? 'bg-[#E1306C]'
                              : 'bg-[#e6edf3]'
                          }`}
                        />
                      ))}
                      {posts.length > 3 && (
                        <span className="text-[8px] text-[#8b949e]">+{posts.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Sidebar: Selected day details */}
      <div className="space-y-4">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#e6edf3]">
              {selectedDate
                ? format(selectedDate, 'dd MMMM yyyy', { locale: idLocale })
                : 'Pilih tanggal'}
            </h3>
            <Link href="/dashboard/post">
              <Button size="sm" variant="primary">
                <PlusCircle className="h-4 w-4" />
                Add Post
              </Button>
            </Link>
          </div>

          {selectedDatePosts.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Calendar className="mb-3 h-10 w-10 text-[#30363d]" />
              <p className="text-sm text-[#8b949e]">Tidak ada post terjadwal</p>
              <p className="mt-1 text-xs text-[#8b949e]">
                Klik &quot;Add Post&quot; untuk menjadwalkan
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDatePosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3 transition-colors hover:border-[#58a6ff]/30"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Badge
                      variant={post.platform === 'instagram' ? 'danger' : 'info'}
                    >
                      {post.platform === 'instagram' ? (
                        <Instagram className="mr-1 h-3 w-3" />
                      ) : (
                        <TikTok className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {post.platform === 'instagram' ? 'Instagram' : 'TikTok'}
                    </Badge>
                    <Badge variant="success">
                      <Clock className="mr-1 h-3 w-3" />
                      {post.scheduledTime}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#e6edf3] line-clamp-2">{post.caption}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="info">{post.mediaType}</Badge>
                    <Badge variant="warning">{post.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming posts */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-[#e6edf3]">Upcoming Posts</h3>
          <div className="space-y-2">
            {scheduledPosts.slice(0, 4).map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-[#21262d]"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    post.platform === 'instagram' ? 'bg-[#E1306C]' : 'bg-[#e6edf3]'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs text-[#e6edf3]">{post.caption}</p>
                  <p className="text-[10px] text-[#8b949e]">
                    {post.scheduledDate} • {post.scheduledTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
