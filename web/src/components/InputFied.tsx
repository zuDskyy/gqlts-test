import React, { InputHTMLAttributes } from 'react';
import { useField } from 'formik';
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';

type InputFiedProps  = InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    textarea?:boolean;
    label:string;
}

export const InputFied: React.FC<InputFiedProps> = ({
    label,
    textarea,
    size:_,

    ...props}) => {


    const [field, {error}]=useField(props);

    let InputOrTextarea = Input

    if(textarea){
       InputOrTextarea  = Textarea
    }
  return (
    <FormControl isInvalid={!!error}>
     
    <FormLabel htmlFor={field.name}>{label}</FormLabel>
    <InputOrTextarea
       {...field}
       {...props}
      id={field.name}
   
    />
    {error ? <FormErrorMessage>{error}</FormErrorMessage>: null}
  </FormControl>
  )
}