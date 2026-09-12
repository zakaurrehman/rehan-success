'use client'
import { useState } from 'react'
import { api, useList, F, Toggle } from '@/components/admin/kit'
import { useFeedback, Modal } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'

type Video = { id: string; title: string; url: string; duration: string | null; isPremium: boolean }
type Course = { id: string; title: string; level: string; description?: string; isPremium?: boolean; videos: Video[] }

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Master', 'COT Research']
const EMPTY_COURSE = { title: '', level: 'Beginner', description: '', isPremium: false }
const EMPTY_VIDEO = { title: '', url: '', duration: '', isPremium: false }

type CourseModal = { mode: 'new' } | { mode: 'edit'; course: Course } | null
type VideoModal = { mode: 'new'; courseId: string } | { mode: 'edit'; courseId: string; video: Video } | null

export default function AdminVideosPage() {
  const { toast, confirm } = useFeedback()
  const { data: courses, setData: setCourses, loading, error, reload } = useList<Course>('/api/classroom?admin=1', (raw) => (raw as { courses?: Course[] }).courses || [])
  const [courseModal, setCourseModal] = useState<CourseModal>(null)
  const [videoModal, setVideoModal] = useState<VideoModal>(null)
  const [cForm, setCForm] = useState(EMPTY_COURSE)
  const [vForm, setVForm] = useState(EMPTY_VIDEO)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault()
    if (!courseModal) return
    setSaving(true)
    try {
      if (courseModal.mode === 'new') {
        const data = await api<Course>('/api/classroom', 'POST', { type: 'course', ...cForm })
        setCourses((prev) => [...prev, { ...data, videos: [] }])
        setExpanded(data.id)
        toast('Course created')
      } else {
        const id = courseModal.course.id
        const data = await api<Course>('/api/classroom', 'PATCH', { type: 'course', id, ...cForm })
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data, videos: c.videos } : c)))
        toast('Course updated')
      }
      setCourseModal(null)
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not save', 'error') } finally { setSaving(false) }
  }

  async function deleteCourse(c: Course) {
    const ok = await confirm({ title: `Delete “${c.title}”?`, message: `This removes its ${c.videos.length} video(s) plus all student progress and certificates for this course. This cannot be undone.`, confirmLabel: 'Delete course' })
    if (!ok) return
    try {
      await api('/api/classroom', 'DELETE', { type: 'course', id: c.id })
      setCourses((prev) => prev.filter((x) => x.id !== c.id))
      toast('Course deleted')
    } catch { toast('Could not delete the course', 'error') }
  }

  async function saveVideo(e: React.FormEvent) {
    e.preventDefault()
    if (!videoModal) return
    setSaving(true)
    const { courseId } = videoModal
    try {
      if (videoModal.mode === 'new') {
        const data = await api<Video>('/api/classroom', 'POST', { type: 'video', courseId, ...vForm })
        setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, videos: [...c.videos, data] } : c)))
        toast('Video added')
      } else {
        const id = videoModal.video.id
        const data = await api<Video>('/api/classroom', 'PATCH', { type: 'video', id, ...vForm })
        setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, videos: c.videos.map((v) => (v.id === id ? { ...v, ...data } : v)) } : c)))
        toast('Video updated')
      }
      setVideoModal(null)
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not save', 'error') } finally { setSaving(false) }
  }

  async function deleteVideo(courseId: string, v: Video) {
    if (!(await confirm({ title: `Delete “${v.title}”?`, message: 'Student progress for this video is removed too. This cannot be undone.', confirmLabel: 'Delete video' }))) return
    try {
      await api('/api/classroom', 'DELETE', { type: 'video', id: v.id })
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, videos: c.videos.filter((x) => x.id !== v.id) } : c)))
      toast('Video deleted')
    } catch { toast('Could not delete the video', 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Classroom" subtitle={`${courses.length} courses · ${courses.reduce((s, c) => s + c.videos.length, 0)} videos`} actions={<Button icon="plus" onClick={() => { setCForm(EMPTY_COURSE); setCourseModal({ mode: 'new' }) }}>New course</Button>} />

      {loading ? <SkeletonList rows={3} height={80} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : courses.length === 0 ? (
        <EmptyState icon="graduation" title="No courses yet" action={<Button icon="plus" onClick={() => { setCForm(EMPTY_COURSE); setCourseModal({ mode: 'new' }) }}>Create a course</Button>} />
      ) : (
        <div className="flex flex-col gap-3">
          {courses.map((course) => {
            const open = expanded === course.id
            return (
              <section key={course.id} className="card-flat overflow-hidden" style={{ boxShadow: 'var(--rs-shadow-xs)' }}>
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button type="button" onClick={() => setExpanded(open ? null : course.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left" aria-expanded={open}>
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--rs-primary-tint)', color: 'var(--rs-primary)' }}><Icon name="graduation" size={19} /></span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 flex-wrap"><span className="text-ink font-bold">{course.title}</span><span className="pill pill-neutral">{course.level}</span>{course.isPremium ? <span className="pill pill-gold">Premium</span> : null}</span>
                      <span className="block text-dim text-xs mt-0.5">{course.videos.length} video{course.videos.length === 1 ? '' : 's'}</span>
                    </span>
                    <Icon name="chevronDown" size={18} className="text-dim ml-auto transition-transform" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
                  </button>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" icon="plus" onClick={() => { setVForm(EMPTY_VIDEO); setVideoModal({ mode: 'new', courseId: course.id }); setExpanded(course.id) }}>Video</Button>
                    <Button size="sm" variant="ghost" icon="edit" aria-label="Edit course" onClick={() => { setCForm({ title: course.title, level: course.level, description: course.description || '', isPremium: !!course.isPremium }); setCourseModal({ mode: 'edit', course }) }} />
                    <Button size="sm" variant="ghost" icon="trash" aria-label="Delete course" onClick={() => deleteCourse(course)} />
                  </div>
                </div>
                {open ? (
                  course.videos.length === 0 ? (
                    <p className="text-dim text-sm px-4 pb-4">No videos yet — add the first lesson.</p>
                  ) : (
                    <ol className="border-t hairline">
                      {course.videos.map((v, i) => (
                        <li key={v.id} className={`flex items-center gap-3 px-4 py-2.5 ${i ? 'border-t hairline' : ''}`}>
                          <span className="num text-dim text-xs w-5">{i + 1}</span>
                          <span className="text-ink text-sm flex-1 min-w-0 truncate">{v.title}</span>
                          {v.duration ? <span className="num text-dim text-xs">{v.duration}</span> : null}
                          {v.isPremium ? <span className="pill pill-gold">Premium</span> : null}
                          <Button size="xs" variant="ghost" icon="edit" aria-label="Edit video" onClick={() => { setVForm({ title: v.title, url: v.url, duration: v.duration || '', isPremium: v.isPremium }); setVideoModal({ mode: 'edit', courseId: course.id, video: v }) }} />
                          <Button size="xs" variant="ghost" icon="trash" aria-label="Delete video" onClick={() => deleteVideo(course.id, v)} />
                        </li>
                      ))}
                    </ol>
                  )
                ) : null}
              </section>
            )
          })}
        </div>
      )}

      <Modal open={courseModal !== null} onClose={() => setCourseModal(null)} title={courseModal?.mode === 'edit' ? 'Edit course' : 'New course'} width={520}>
        <form onSubmit={saveCourse} className="flex flex-col gap-3">
          <F label="Title" htmlFor="c-title"><input id="c-title" className="field" value={cForm.title} onChange={(e) => setCForm((f) => ({ ...f, title: e.target.value }))} required /></F>
          <F label="Level" htmlFor="c-level"><select id="c-level" className="field" value={cForm.level} onChange={(e) => setCForm((f) => ({ ...f, level: e.target.value }))}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></F>
          <F label="Description" htmlFor="c-desc"><textarea id="c-desc" className="field" rows={3} value={cForm.description} onChange={(e) => setCForm((f) => ({ ...f, description: e.target.value }))} required /></F>
          <Toggle checked={cForm.isPremium} onChange={(v) => setCForm((f) => ({ ...f, isPremium: v }))} label="Premium course" description="Locked for members below the Premium plan." />
          <div className="flex justify-end gap-2 mt-2"><Button variant="secondary" onClick={() => setCourseModal(null)}>Cancel</Button><Button type="submit" loading={saving}>Save course</Button></div>
        </form>
      </Modal>

      <Modal open={videoModal !== null} onClose={() => setVideoModal(null)} title={videoModal?.mode === 'edit' ? 'Edit video' : 'Add video'} width={520}>
        <form onSubmit={saveVideo} className="flex flex-col gap-3">
          <F label="Video title" htmlFor="v-title"><input id="v-title" className="field" value={vForm.title} onChange={(e) => setVForm((f) => ({ ...f, title: e.target.value }))} required /></F>
          <F label="YouTube URL" htmlFor="v-url" hint="youtube.com/watch?v=… or youtu.be/… links are embedded automatically."><input id="v-url" className="field" value={vForm.url} onChange={(e) => setVForm((f) => ({ ...f, url: e.target.value }))} required /></F>
          <F label="Duration (e.g. 12:30)" htmlFor="v-dur"><input id="v-dur" className="field num" value={vForm.duration} onChange={(e) => setVForm((f) => ({ ...f, duration: e.target.value }))} /></F>
          <Toggle checked={vForm.isPremium} onChange={(v) => setVForm((f) => ({ ...f, isPremium: v }))} label="Premium video" />
          <div className="flex justify-end gap-2 mt-2"><Button variant="secondary" onClick={() => setVideoModal(null)}>Cancel</Button><Button type="submit" loading={saving}>Save video</Button></div>
        </form>
      </Modal>
    </div>
  )
}
