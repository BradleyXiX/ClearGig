/**
 * ClearGig Contact Information
 * Owner-supplied public business contact details for project enquiries.
 */

export interface ContactInfo {
  email: {
    display: string;
    href: string;
  };
  whatsapp: {
    display: string;
    href: string;
    numberOnly: string;
  };
  github: {
    handle: string;
    href: string;
  };
}

export const CONTACT_INFO: ContactInfo = {
  email: {
    display: "Bradjohn70@gmail.com",
    href: "mailto:Bradjohn70@gmail.com?subject=ClearGig%20enquiry",
  },
  whatsapp: {
    display: "+254 703 966 756",
    href: "https://wa.me/254703966756?text=Hi%20Bradley%2C%20I%27d%20like%20to%20discuss%20ClearGig.",
    numberOnly: "254703966756",
  },
  github: {
    handle: "BradleyXiX",
    href: "https://github.com/BradleyXiX",
  },
};
