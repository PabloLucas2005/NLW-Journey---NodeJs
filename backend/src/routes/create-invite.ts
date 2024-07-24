import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../lib/prisma";
import { dayjs } from '../lib/dayjs';
import { getEmailClient } from "../lib/mail";
import nodemailer from 'nodemailer';
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function createInvite(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites', {
    schema:{
      params: z.object({
        tripId: z.string().uuid()
      }),
      body: z.object({
        email:z.string().email()
      })
    },
  } ,async (req, res) =>{
    const { tripId } = req.params

    const { email } = req.body

    const trip = await prisma.trip.findUnique({
      where:{
        id:tripId
      }
    })

    if(!trip)
       throw new ClientError('Trip not found.')

    const participant = await prisma.participant.create({
      data:{
        email,
        trip_id:tripId
      }
    })

    const owner = prisma.participant.findUnique({
      where:{
        id:participant.id,
        trip_id:tripId,
        is_owner:true
      }
    })

    
    
    const formattedStartDate = dayjs(trip.starts_at).format('LL')
    const formattedEndDate = dayjs(trip.ends_at).format('LL')

    

    const mail = await getEmailClient()

    
        const confimationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`
        const message = await mail.sendMail({
          from: {
            name:'Equipe plann.er',
            address: 'oi@plann.er',
    
          },
          to: participant.email,
          subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
          html: `
          <div>
            <p style="font-family: sans-serif;font-size: 16px; line-height: 1.6;">Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}, Brasil</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong> ${formattedEndDate} </strong> </p>
            <p></p>
            <p>Para confirmar sua viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confimationLink}">Confirmar viagem</a>
            </p>
            <p></p>
            <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
          </div>
          `.trim()
        })
    
        console.log(nodemailer.getTestMessageUrl(message))
        return { participant:participant.id}
      })
    

  
  }
