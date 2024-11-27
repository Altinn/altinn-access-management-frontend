using Altinn.Platform.Profile.Enums;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// Class describing a user profile for use in the front end GUI. Notably, this model does not include the party's ssn
    /// </summary>
    public class UserProfileFE
    {
        /// <summary>
        /// Gets or sets the ID of the user
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Gets or sets the UUID of the user
        /// </summary>
        public Guid? UserUuid { get; set; }

        /// <summary>
        /// Gets or sets the username
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Gets or sets ExternalIdentity
        /// </summary>
        public string ExternalIdentity { get; set; }

        /// <summary>
        /// Gets or sets a boolean indicating whether the user has reserved themselves from electronic communication
        /// </summary>
        public bool IsReserved { get; set; }

        /// <summary>
        /// Gets or sets the phone number
        /// </summary>
        public string PhoneNumber { get; set; }

        /// <summary>
        /// Gets or sets the email address
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Gets or sets the party ID
        /// </summary>
        public int PartyId { get; set; }

        /// <summary>
        /// Gets or sets the <see cref="Party"/>
        /// </summary>
        public PartyFE Party { get; set; }

        /// <summary>
        /// Gets or sets the <see cref="UserType"/>
        /// </summary>
        public UserType UserType { get; set; }

        /// <summary>
        /// Gets or sets the <see cref="ProfileSettingPreference"/>
        /// </summary>
        public ProfileSettingPreference ProfileSettingPreference { get; set; }

        /// <summary>
        /// Creates a UserProfileFE object from a UserProfile object
        /// </summary>
        /// <param name="userProfile">A UserProfile object</param>
        public UserProfileFE(UserProfile userProfile)
        {
            UserId = userProfile.UserId;
            UserUuid = userProfile.UserUuid;
            UserName = userProfile.UserName;
            ExternalIdentity = userProfile.ExternalIdentity;
            IsReserved = userProfile.IsReserved;
            PhoneNumber = userProfile.PhoneNumber;
            Email = userProfile.Email;
            PartyId = userProfile.PartyId;
            UserType = userProfile.UserType;
            ProfileSettingPreference = userProfile.ProfileSettingPreference;
            Party = new PartyFE(userProfile.Party);
        }

        /// <summary>
        /// Default constructor
        /// </summary>
        public UserProfileFE()
        {
        }
    }
}
