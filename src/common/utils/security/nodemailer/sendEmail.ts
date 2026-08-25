import nodemailer from "nodemailer";

const createTransport = () => {

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

export const sendEmail = async ({ to, subject, attachements, html }: { to: string, subject: string, attachements?: any, html: string }) => {
    const transport = createTransport();
    const from = `"Social App" <${process.env.EMAIL}>`;

    const info = await transport.sendMail({
        from,
        to,
        subject,
        html,
    });

    console.log("Message sent: %s", info.messageId);
    return info.accepted.length > 0;
};

export const generateOTP = () => {
    const otp: number = Math.floor(100000 + Math.random() * 900000);
    return otp;
}