import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EditProfileForm from "../../components/profile/edit/EditProfileForm";
import EditProfileHeader from "../../components/profile/edit/EditProfileHeader";
import { useEditProfileForm } from "../../hooks/useEditProfileForm";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    isUpdatingProfile,
    showPassword,
    togglePasswordVisibility,
  } = useEditProfileForm(authUser);

  if (!authUser) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <EditProfileHeader onBack={() => navigate(-1)} />
      <EditProfileForm
        formData={formData}
        errors={errors}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        isUpdating={isUpdatingProfile}
        showPassword={showPassword}
        onTogglePasswordVisibility={togglePasswordVisibility}
      />
    </div>
  );
};

export default EditProfilePage;
