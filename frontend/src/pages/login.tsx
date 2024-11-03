import React, { useEffect, useState}  from "react";


const loginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();   
        // console.log("Email:", email);
        // console.log("Password:", password);
        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({   
                email,
                password
                })
            });
            const loginData = await response.json();
            // console.log(response)
            // console.log(response.ok)
            if (!response.ok) {
                setErrorMessage(loginData.msg); 
                //TODO: Do not redirect
            } else {
                console.log(loginData);
                setLoginData(loginData);
                setErrorMessage(''); // Clear any previous error message
                //TODO: redirect to specific page
            }
  
        } catch (error) {
            console.error('Error fetching login data:', error);            
            //add other errors, such as unauthorized, etc
        }
    };

    //initialize loginData as an object
    const [loginData, setLoginData] = useState<any | null>(null);
    
    return(
        // change this to center the form
        // <div className="w-full px-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="w-full flex items-center justify-center gap-4">
            
            <form className="py-10" onSubmit={handleSubmit}>
                <h2 className="font-bold items-center">Enter login details</h2>
                <div className=" flex items-center gap-2">
                <label htmlFor="email">Email:</label>
                    <input
                        className="w-full h-full rounded-md px-2 placeholder:text-sm text-base text-black border-[2px] border-amazon_light outline-none
                focus-visible:border-amazon_yellow"
                        type="email"
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                </div>
                <div className="flex items-center gap-2">
                <label htmlFor="password">Password:</label>
                    <input
                        className="w-full h-full rounded-md px-2 placeholder:text-sm text-base text-black border-[2px] border-amazon_light outline-none
                focus-visible:border-amazon_yellow"
                        type="text" //TODO: make this password type so it hides
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                    </div>
                <button type="submit" className="w-full h-10 rounded-md font-medium bg-amazon_blue text-white hover:bg-amazon_yellow 
                                hover:text-black duration-300 mt-2">Login</button>
                
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} 
            <p>New to Nezeza? <a className="text-amazon_yellow hover:text-amazon_blue  hoverunderline decoration-[1px]
            cursor-pointer duration-250" href="http://localhost:3000/register">
            Signup</a></p>    
            </form>
                
                
        </div>
    );

}

export default loginPage;