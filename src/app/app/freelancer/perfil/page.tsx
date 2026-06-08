import { FreelancerProfileForm } from "@/components/forms/freelancer-profile-form";
import { AppHeader } from "@/components/layout/app-header";
import {
  getActiveSpecialties,
  getFreelancerAvailability,
  getFreelancerProfile,
  getFreelancerSpecialtyIds,
} from "@/lib/profiles/profile-store";
import { requireFreelancer } from "@/server/guards/auth";

export default async function FreelancerProfilePage() {
  const user = await requireFreelancer();
  const profile = await getFreelancerProfile(user.id);
  const [specialties, selectedSpecialtyIds, availability] = await Promise.all([
    getActiveSpecialties(),
    profile ? getFreelancerSpecialtyIds(profile.id) : Promise.resolve(new Set<string>()),
    profile ? getFreelancerAvailability(profile.id) : Promise.resolve([]),
  ]);

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <AppHeader title="Perfil do freelancer" userName={user.name} />
      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Meu perfil</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Mantenha seus dados atualizados para se candidatar e receber contato
            apos o aceite.
          </p>
        </div>
        <FreelancerProfileForm
          user={user}
          profile={profile}
          specialties={specialties}
          selectedSpecialtyIds={selectedSpecialtyIds}
          availability={availability}
        />
      </section>
    </main>
  );
}
