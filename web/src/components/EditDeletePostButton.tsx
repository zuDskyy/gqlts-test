import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { Box, IconButton } from '@chakra-ui/react'
import React from 'react'
import NextLink from "next/link"
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';


interface EditDeletePostButtonProps {
    id: number;
    creatorId:number;
}

export const EditDeletePostButton: React.FC<EditDeletePostButtonProps> = ({ id , creatorId}) => {

    const [, deletePost] = useDeletePostMutation();

    const [{data: meData}] = useMeQuery();
    if(meData?.me?.id !== creatorId ){
        return null
    }
    return (
        <Box >
            <NextLink href='/post/edit/[id]' as={`/post/edit/${id}`}>
                <IconButton
                    mr={4}
                    as={EditIcon}
                    boxSize={8}
                    padding={2}
                    aria-label="Edit Post"
                />
            </NextLink>
            <IconButton
                as={DeleteIcon}
                boxSize={8}
                padding={2}
                bgColor="red"
                aria-label="Delete Post"
                onClick={() => {
                    deletePost({ id })
                }} />
        </Box>
    )
}