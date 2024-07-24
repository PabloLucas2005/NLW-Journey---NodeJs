import fastify from 'fastify'
import { createTrip } from './routes/create-trip'
import { confirmTrip } from './routes/confirm-trip'
import { confirmParticipants } from './routes/confirm-participant'
import { getActivity } from './routes/get-activities'
import { getLink } from './routes/get-link'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'
import cors from '@fastify/cors'
import { createActivity } from './routes/create-activity'
import { createLink } from './routes/create-link'
import { getParticipants } from './routes/get-participants'
import { createInvite } from './routes/create-invite'
import { updateTrip } from './routes/update-trip'
import { getTripDetails } from './routes/get-trip-details'
import { getParticipant } from './routes/get-participant'
import { errorHandler } from './error-handler'
import { env } from './env'

const app = fastify()

app.register(cors, {
  origin:'*'
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.setErrorHandler(errorHandler)

app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipants)
app.register(createActivity)
app.register(getActivity)
app.register(createLink)
app.register(getLink)
app.register(getParticipants)
app.register(createInvite)
app.register(updateTrip)
app.register(getTripDetails)
app.register(getParticipant)
app.listen({port: env.PORT }).then(()=>{
  console.log('Server running')
})  