import AddAssignmentModal from "@/components/models/assignment/AddAssignmentModal";
import Image from "next/image";

const NoAssignmentCard = () => {
  return (
    <section className="flex flex-col items-center justify-center mt-20">
      <h1 className="font-extrabold text-2xl tracking-wide">
        Want to make assignments to keep a record?
      </h1>
      <AddAssignmentModal>
        <Image
          src="/addAssignment.png"
          alt="add"
          width={500}
          height={500}
          className="mt-6 cursor-pointer"
        />
      </AddAssignmentModal>
      {/* <div className="mt-24 p-12 bg-astro-zinger rounded-lg relative">
        <h2 className="font-semibold text-xl text-liberty-blue px-12 mb-1">
          Add Assignment?
        </h2>
        <div className="w-full border-t border-2 border-ceremonial-purple" />
        <AddAssignmentModal>
          <button
            className={`mt-10 dark:text-white dark:bg-ceremonial-purple p-3 rounded-[30px]
              w-full font-semibold text-center text-lg border-2 border-black boxShadow`}
          >
            Click me!
          </button>
        </AddAssignmentModal>
      </div>
      <div className="pointer-events-none bg-transparent rounded-2xl absolute z-10 w-[382px] h-[230px] border-8 mt-24 mr-7 border-violet-mix" />
      <Image
        src="/quots.png"
        alt="quots"
        width={100}
        height={100}
        className="absolute z-20 -translate-x-[12.5rem] scale-x-[-1] -translate-y-16"
      />
      <Image
        src="/quots.png"
        alt="quots"
        width={100}
        height={100}
        className="absolute z-20 rotate-180 scale-x-[-1] translate-x-[10.75rem] translate-y-40"
      /> */}
    </section>
  );
};

export default NoAssignmentCard;
