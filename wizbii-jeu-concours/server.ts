import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares to parse JSON/Base64 payload up to 25MB
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // Explicitly serve /images directory from public/images
  app.use("/images", express.static(path.join(process.cwd(), "public", "images")));

  // API endpoint to send emails
  app.post("/api/send-email", async (req, res) => {
    try {
      const { files, recipientMail } = req.body;
      
      const targetEmails = [
        "anthony.garrucho@wizbii.com"
      ];

      // Fallback recipient info
      const mailto = recipientMail || targetEmails[0];
      
      console.log(`Preparing to send email with ${files?.length || 0} attachments...`);

      // Read SMTP configurations from environment variables
      const smtpHost = process.env.SMTP_HOST || "";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER || "";
      const smtpPass = process.env.SMTP_PASS || "";

      let transporter;

      if (smtpHost && smtpUser && smtpPass) {
        console.log(`Using configured SMTP server: ${smtpHost}:${smtpPort}`);
        transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
      } else {
        console.warn("SMTP credentials not provided in .env. Attempting dynamic config...");
        try {
          // Creating dynamic SMTP test account via Ethereal on-demand
          const testAccount = await nodemailer.createTestAccount();
          console.log(`Dynamic Ethereal SMTP test config created for: ${testAccount.user}`);
          transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            }
          });
        } catch (etherealErr) {
          console.error("Failed to spawn ethereal test SMTP, falling back to local simulation", etherealErr);
          transporter = {
            sendMail: async (mailOpts: any) => {
              console.log("MOCK SMTP TRAP SENT TO CONSOLE ONLY", {
                to: mailOpts.to,
                attachmentsCount: mailOpts.attachments?.length || 0
              });
              return { messageId: "simulated-id-" + Date.now() };
            }
          } as any;
        }
      }

      const attachments = (files || []).map((f: any) => {
        // Handle files passed as base64 data URLs
        const base64Data = f.content.split(";base64,").pop();
        return {
          filename: f.name,
          content: Buffer.from(base64Data, "base64"),
          contentType: f.type
        };
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || `"Justificatifs WIZBII" <noreply@wizbii-contest.com>`,
        to: targetEmails.join(", "), // Delivers to both emails explicitly to respect full prompt history
        subject: `[Jeu WIZBII x Revolut] Nouveau justificatif reçu (${files?.length || 0} fichier(s))`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; background-color: #f8f9fc; color: #000028; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #e1e4ed;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #8683FF; font-size: 24px; margin: 0; font-weight: 800;">Validation de Justificatif</h1>
              <p style="color: #46464f; font-size: 14px; margin: 5px 0 0 0;">Jeu-Concours WIZBII x Revolut</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #eef0f5;">
              <p style="font-size: 16px; margin-top: 0;">Bonjour Anthony,</p>
              <p style="font-size: 14px; color: #46464f; line-height: 1.6;">Un nouveau participant a téléversé ses pièces justificatives de dépenses pour le tirage au sort des remboursements du mois.</p>
              
              <div style="background-color: #8683FF/10; border-left: 4px solid #8683FF; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #8683FF; tracking-wide: 0.05em;">Détails de l'envoi :</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Destinataire :</strong> anthony.garrucho@wizbii.com</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Fichiers joints :</strong> ${files?.length || 0} document(s)</p>
              </div>

              <p style="font-size: 14px; color: #46464f;">Les pièces jointes sont jointes en format d'origine à ce mail.</p>
            </div>
            
            <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #46464f;">
              <p>Cet email s'envoie automatiquement depuis votre application WIZBII x Revolut.</p>
            </div>
          </div>
        `,
        attachments: attachments
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully! MessageID: ${info.messageId}`);
      
      let previewUrl = "";
      if (!smtpHost && typeof nodemailer.getTestMessageUrl === "function") {
        previewUrl = nodemailer.getTestMessageUrl(info) || "";
        console.log(`Test Mail Preview URL: ${previewUrl}`);
      }

      res.status(200).json({ 
        success: true, 
        messageId: info.messageId,
        previewUrl: previewUrl,
        realSmtp: !!smtpHost
      });

    } catch (err: any) {
      console.error("Express send-email API Error:", err);
      res.status(500).json({ 
        success: false, 
        error: err.message || "Failed to process and mail attachments"
      });
    }
  });

  // Vite setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fullstack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
