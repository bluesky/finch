import { cn } from "@/lib/utils";
import '@/components/style.css'

export type PaperProps = {
    size?: 'small' | 'medium' | 'large' | 'full' | 'grow',
    rounded?: 'none' | 'small' | 'medium' | 'large' ,
    title?: string,
    className?: string,
    children?: React.ReactNode,
}
export default function Paper({size="full", rounded="medium", title, className, children }: PaperProps) {

}