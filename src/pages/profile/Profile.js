import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Container,
  Input,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { 
  getProfile, 
  updateProfile, 
  updatePassword,
  validateProfilePicture 
} from "../../api/profileApi";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    profilePic: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const breadcrumbItems = [
    { title: "Dashboard", link: "/" },
    { title: "Profile", link: "#" },
  ];

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await getProfile();
      
      if (response.success) {
        const userData = response.user;
        setUser({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "",
          phone: userData.phone || "",
          profilePic: userData.profilePic || "",
        });
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast.error(error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle input change
  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      try {
        validateProfilePicture(file);
        setSelectedFile(file);
        setErrors((prev) => ({ ...prev, pic: "" }));
      } catch (error) {
        setErrors((prev) => ({ ...prev, pic: error.message }));
        setSelectedFile(null);
      }
    }
  };

  // Handle password input change
  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    if (!user.name) newErrors.name = "Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const profileData = {
        name: user.name,
      };

      if (selectedFile) {
        profileData.pic = selectedFile;
      }

      const response = await updateProfile(profileData);

      if (response.success) {
        toast.success(response.msg || "Profile updated successfully");
        setSelectedFile(null);
        setErrors({});
        fetchUserProfile();
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    if (!passwordData.current_password)
      newErrors.current_password = "Current Password is required";
    if (!passwordData.new_password)
      newErrors.new_password = "New Password is required";
    if (!passwordData.confirm_password)
      newErrors.confirm_password = "Confirm Password is required";

    if (
      passwordData.new_password &&
      passwordData.confirm_password &&
      passwordData.new_password !== passwordData.confirm_password
    ) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await updatePassword(passwordData);

      if (response.success) {
        toast.success(response.msg || "Password updated successfully");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Update password error:", error);
      
      // Handle specific error for wrong password
      if (error.includes("incorrect")) {
        setErrors({ current_password: "Current password is incorrect" });
      } else {
        toast.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get profile picture URL
  const getProfilePicUrl = () => {
    if (!user.profilePic) return null;
    
    if (user.profilePic.startsWith("http")) {
      return user.profilePic;
    }
    
    return `${process.env.REACT_APP_API_BASE_URL}/profile/${user.profilePic}`;
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="PROFILE" breadcrumbItems={breadcrumbItems} />
        <Row>
          {/* Profile Update Card */}
          <Col xl="6">
            <Card>
              <CardBody>
                <h2 className="card-title fs-5 mb-4">Profile Page</h2>
                <form
                  className="needs-validation"
                  onSubmit={handleUpdateSubmit}
                >
                  <Row>
                    <Col md="12">
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="name">
                          Name
                        </Label>
                        <Input
                          name="name"
                          placeholder="Name"
                          type="text"
                          value={user.name}
                          onChange={handleInput}
                        />
                        {errors.name && (
                          <div className="text-danger">{errors.name}</div>
                        )}
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="email">
                          Email
                        </Label>
                        <Input
                          name="email"
                          placeholder="Email"
                          type="email"
                          value={user.email}
                          disabled
                          readOnly
                        />
                        <small className="text-muted">
                          Email cannot be changed
                        </small>
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="role">
                          Role
                        </Label>
                        <Input
                          name="role"
                          placeholder="Role"
                          type="text"
                          value={user.role}
                          disabled
                          readOnly
                        />
                        <small className="text-muted">
                          Role is managed by admin
                        </small>
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="mb-3">
                        <Label className="form-label">Profile Picture</Label>
                        <div className="input-group">
                          <input
                            type="file"
                            className="form-control"
                            name="pic"
                            onChange={handleFileChange}
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          />
                        </div>
                        {errors.pic && (
                          <div className="text-danger">{errors.pic}</div>
                        )}
                        <small className="text-muted">
                          Max size: 5MB. Allowed: JPEG, PNG, GIF, WEBP
                        </small>
                      </div>

                      {user.profilePic && (
                        <div className="mb-3">
                          <Label className="form-label">Current Picture</Label>
                          <div>
                            <img
                              src={getProfilePicUrl()}
                              alt="Profile"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                              onError={(e) => {
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>
                  <Button color="primary" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardBody>
            </Card>
          </Col>

          {/* Reset Password Card */}
          <Col xl="6">
            <Card>
              <CardBody>
                <h2 className="card-title fs-5 mb-4">Change Password</h2>
                <form
                  onSubmit={handleUpdatePassword}
                  className="needs-validation"
                >
                  <Row>
                    <Col md="12">
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="currentPass">
                          Current Password
                        </Label>
                        <Input
                          type="password"
                          id="currentPass"
                          name="current_password"
                          value={passwordData.current_password}
                          onChange={handlePasswordInput}
                          placeholder="Enter current password"
                        />
                        {errors.current_password && (
                          <div className="text-danger">
                            {errors.current_password}
                          </div>
                        )}
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="newPass">
                          New Password
                        </Label>
                        <Input
                          type="password"
                          id="newPass"
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordInput}
                          placeholder="Enter new password"
                        />
                        {errors.new_password && (
                          <div className="text-danger">
                            {errors.new_password}
                          </div>
                        )}
                        <small className="text-muted">
                          Minimum 8 characters
                        </small>
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="confirmPass">
                          Confirm Password
                        </Label>
                        <Input
                          type="password"
                          id="confirmPass"
                          name="confirm_password"
                          value={passwordData.confirm_password}
                          onChange={handlePasswordInput}
                          placeholder="Confirm new password"
                        />
                        {errors.confirm_password && (
                          <div className="text-danger">
                            {errors.confirm_password}
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                  <Button color="primary" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Change Password"}
                  </Button>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;