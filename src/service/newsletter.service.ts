import { Newsletter } from "../model/Newsletter";



export const createNewsletter = async(name: string, email: string) => {
    try {
        const newsletter = await Newsletter.create({
            name,
            email
        });
         console.log(newsletter)
        return newsletter
    } catch (error) {
         console.log(error)
    }
}