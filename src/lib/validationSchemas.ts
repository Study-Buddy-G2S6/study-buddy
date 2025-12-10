import * as Yup from 'yup';

export const AddStuffSchema = Yup.object({
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const EditStuffSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const CreateSessionSchema = Yup.object({
  name: Yup.string().required(),
  courseId: Yup.number().required(),
  location: Yup.string().required(),
  description: Yup.string().optional(),
  startDate: Yup.date().required(),
  endDate: Yup.date().required(),
  userId: Yup.number().required(),
  owner: Yup.string().required(),
  createdAt: Yup.date().required(),
  updatedAt: Yup.date().required(),
});

export const EditSessionSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  courseId: Yup.number().required(),
  location: Yup.string().required(),
  description: Yup.string().optional(),
  startDate: Yup.date().required(),
  endDate: Yup.date().required(),
  userId: Yup.number().required(),
  owner: Yup.string().required(),
  createdAt: Yup.date().required(),
  updatedAt: Yup.date().required(),
});
