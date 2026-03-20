import { HStack } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { Tag } from '../ui/tag';

export interface TagGroupItem {
  bgColor: string;
  color: string;
  label: string;
  id: string;
}

interface TagGroupProps {
  tags: TagGroupItem[];
  duration?: number;
}

const AnimatedTag = motion.create(Tag);

export const TagGroup: React.FC<TagGroupProps> = ({ tags, duration = 0.2 }) => {
  return (
    <HStack alignItems='center' maxWidth='100%' gap={'0.25rem'}>
      <AnimatePresence initial={false}>
        {tags.map(tag => (
          <AnimatedTag
            style={{
              boxShadow: '2px 2px 4px 0px #00000040 inset',
            }}
            color={tag.color}
            key={`${tag.id}`}
            bgColor={tag.bgColor}
            px={{ base: '3.5', md: 4 }}
            py={2}
            m={0.5}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              duration,
              ease: [0.1, 0.1, 0.1, 0.1],
            }}
            layout
            size={'lg'}>
            {tag.label}
          </AnimatedTag>
        ))}
      </AnimatePresence>
    </HStack>
  );
};

export default TagGroup;
