import Navigation from "@/components/Navigation";
import ProfileForm from "@/components/profile/ProfileForm";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <div className="bg-white border-b">
            <div className="container mx-auto py-4">
              <h1 className="text-2xl font-semibold text-dara-navy">Profile Settings</h1>
            </div>
          </div>
          <div className="container mx-auto p-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <ProfileForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;