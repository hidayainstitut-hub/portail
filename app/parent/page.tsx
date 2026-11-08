"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface CourseReport {
  id: string;
  summary: string;
  homework: string | null;
  course_date: string;
  group_id: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<CourseReport[]>([]);
  const [parentName, setParentName] = useState("");
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
  const [agendaCourses, setAgendaCourses] = useState<Array<{
    id: string;
    title: string;
    scheduled_at: string;
    group_name: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setErrorMessage("Veuillez vous reconnecter pour consulter les comptes-rendus.");
        setLoading(false);
        return;
      }

      const { data: parentProfile } = await supabase
        .from("profiles")
        .select("nom, role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!parentProfile || parentProfile.role !== "parent") {
        await supabase.auth.signOut();
        router.replace("/connexion");
        return;
      }

      setParentName(parentProfile?.nom ?? "");

      const { data: children, error: childrenError } = await supabase
        .from("profiles")
        .select("nom, groupeId, groupeNom, groupe, group_id")
        .eq("parent_id", userData.user.id);

      if (childrenError) {
        setErrorMessage(childrenError.message);
        setLoading(false);
        return;
      }

      const groupIds = (children ?? [])
        .flatMap((child) => [
          child.groupeId,
          child.groupeNom,
          child.groupe,
          child.group_id,
        ])
        .filter((value): value is string => typeof value === "string" && value.length > 0);

      setChildrenNames(
        (children ?? [])
          .map((child) => child.nom)
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      );

      if (groupIds.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, scheduled_at, group_name")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(20);

      if (!coursesError && courses) {
        setAgendaCourses(courses);
      }

      const { data, error } = await supabase
        .from("course_reports")
        .select("id, summary, homework, course_date, group_id")
        .eq("is_published", true)
        .in("group_id", [...new Set(groupIds)])
        .order("course_date", { ascending: false })
        .limit(10);

      if (error) {
        setErrorMessage(error.message);
      } else {
        setReports(data ?? []);
      }

      setLoading(false);
    }

    fetchReports();
  }, [router]);

  return (
    <main className="min-h-screen bg-green-50 px-6 py-10">
      <section className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Espace Parent</h1>
          {parentName && <p className="mt-1 font-semibold text-green-800">{parentName}</p>}
          {childrenNames.length > 0 && (
            <p className="mt-2 text-green-700">Enfants : {childrenNames.join(", ")}</p>
          )}
          <p className="mt-2 text-green-700">Comptes-rendus récents des séances.</p>
        </div>

        <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-green-900">📅 Agenda des cours</h2>
          {agendaCourses.length === 0 ? (
            <p className="mt-3 text-sm text-green-700">Aucun cours planifié pour le moment.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {agendaCourses.map((course) => (
                <article key={course.id} className="rounded-xl border border-green-100 bg-green-50/40 p-4">
                  <p className="font-bold text-green-900">{course.title}</p>
                  <p className="mt-1 text-sm text-green-700">
                    {course.group_name} · {new Date(course.scheduled_at).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {loading ? (
          <p className="rounded-2xl bg-white p-6 text-green-800 shadow-sm">Chargement...</p>
        ) : errorMessage ? (
          <p className="rounded-2xl bg-red-50 p-6 text-red-700 shadow-sm">{errorMessage}</p>
        ) : reports.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-green-800 shadow-sm">
            Aucun compte-rendu publié pour le moment.
          </p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <article key={report.id} className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-green-700">
                  {new Date(report.course_date).toLocaleDateString("fr-FR")}
                </p>
                <p className="mt-3 text-green-900">{report.summary}</p>
                {report.homework && (
                  <p className="mt-3 rounded-xl bg-green-50 p-3 text-green-800">
                    <strong>Devoir :</strong> {report.homework}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
