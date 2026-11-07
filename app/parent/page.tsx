"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface CourseReport {
  id: string;
  summary: string;
  homework: string | null;
  course_date: string;
  group_id: string;
}

export default function ParentDashboard() {
  const [reports, setReports] = useState<CourseReport[]>([]);
  const [parentName, setParentName] = useState("");
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
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
        .select("full_name")
        .eq("id", userData.user.id)
        .maybeSingle();

      setParentName(parentProfile?.full_name ?? "");

      const { data: children, error: childrenError } = await supabase
        .from("profiles")
        .select("full_name, groupeId, groupeNom, groupe, group_id")
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
          .map((child) => child.full_name)
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      );

      if (groupIds.length === 0) {
        setReports([]);
        setLoading(false);
        return;
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
  }, []);

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
