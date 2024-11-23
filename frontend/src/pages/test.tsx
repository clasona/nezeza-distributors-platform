interface Contact {
  email: string;
  phone: string;
}


interface Address {
  street: string;
  city: string;
  zipCode: string;
}

interface Person {
  name: string;
  age: number;
  contact: Contact;
  address: Address;
}

const myInfo: Person = {
    name: "yves";,
    age: 25,
    contact: {
        email: "test",
        phone: 67654;
    },
    address: {
        street: &quot;123 Main St&quot;,
        city: &quot;Anytown&quot;,
        zipCode: &quot;12345&quot;
    }
};